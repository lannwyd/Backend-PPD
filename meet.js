import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { ExpressPeerServer } from 'peer';
import { fileURLToPath } from 'url';
import cors from 'cors';
import sequelize from "./models/db.js";
import setupAssociations from "./models/associations.js";
import Session from "./models/Session.js";
import JoinedUsers from "./models/JoinedUsers.js";
import { protect } from "./src/controllers/authController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    setupAssociations();

    await sequelize.sync({ alter: true });
    console.log("🔄 Database synchronized");

    const { Role } = sequelize.models;
    await Role.findOrCreate({ where: { role_label: "student" } });
    await Role.findOrCreate({ where: { role_label: "teacher" } });
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Configure Socket.IO with proper CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Configure CORS for Express
app.use(cors({
  origin: '*'
}));

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peerjs', peerServer);

// Store active sessions and users
const sessions = new Map();
const users = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meeting.html'));
});

app.post('/create-session' ,async (req, res) => {
  try {
    console.log('Create session request:', req.body);
    const { sessionName, description } = req.body;
    
    if (!sessionName) {
      return res.status(400).json({ error: 'Session name is required' });
    }
    
    const sessionId = generateSessionId();
    
    sessions.set(sessionId, {
      id: sessionId,
      name: sessionName,
      description: description || '',
      host: null,
      participants: [],
      createdAt: new Date(),
      isActive: true
    });
    await Session.create({
      session_id: sessionId,
      session_name: sessionName,
      description: description || '',
      session_date: new Date(),
      session_start_time: null,
      session_end_time: null
    });
    
    console.log('Session created:', sessionId);
    res.json({ sessionId, message: 'Session created successfully' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/:sessionId' ,(req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    res.sendFile(path.join(__dirname, 'public', 'meeting.html'));
  } else {
    res.status(404).send('Session not found');
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  

  // Handle session status check
  socket.on('check-session-status', ({ sessionId }) => {
    try {
      if (!sessions.has(sessionId)) {
        socket.emit('error', 'Session not found');
        return;
      }

      const session = sessions.get(sessionId);
      const shouldBeHost = !session.host && session.participants.length === 0;
      
      socket.emit('session-status', { shouldBeHost });
      console.log(`Session status check for ${sessionId}: shouldBeHost = ${shouldBeHost}`);
    } catch (error) {
      console.error('Error checking session status:', error);
      socket.emit('error', 'Failed to check session status');
    }
  });

  socket.on('join-session', ({ sessionId, userName, isHost, peerId }) => {
    try {
      console.log(`Join session request: ${userName} -> ${sessionId} (${isHost ? 'host' : 'participant'})`);
      
      if (!sessions.has(sessionId)) {
        console.log('Session not found:', sessionId);
        socket.emit('error', 'Session not found');
        return;
      }

      const session = sessions.get(sessionId);
      
      // Create user object
      const user = {
        id: socket.id,
        name: userName,
        isHost: false, // Will be set properly below
        sessionId: sessionId,
        peerId: peerId,
        joinedAt: new Date()
      };

      // Join the session room
      socket.join(sessionId);
      users.set(socket.id, user);

      // Determine if user should be host
      const shouldBeHost = !session.host && session.participants.length === 0;
      
      if (shouldBeHost) {
        // First user becomes host
        user.isHost = true;
        session.host = user;
        socket.emit('host-privileges', true);
        console.log(`${userName} assigned as host for session ${sessionId}`);
      } else if (isHost && session.host) {
        // User requested to be host but host already exists
        user.isHost = false;
        session.participants.push(user);
        socket.emit('viewer-mode', true);
        console.log(`${userName} joined as participant (host already exists) in session ${sessionId}`);
      } else {
        // Regular participant
        user.isHost = false;
        session.participants.push(user);
        socket.emit('viewer-mode', true);
        console.log(`${userName} joined as participant in session ${sessionId}`);
      }

      // Update session
      sessions.set(sessionId, session);

      // Get all connected users (including the new user)
      const connectedUsers = [session.host, ...session.participants].filter(u => u);
      
      // Send existing peers to new user (excluding themselves)
      const existingPeers = connectedUsers
        .filter(u => u.id !== socket.id)
        .map(u => ({ 
          peerId: u.peerId, 
          name: u.name, 
          isHost: u.isHost 
        }));
      
      if (existingPeers.length > 0) {
        socket.emit('existing-peers', existingPeers);
        console.log(`Sent ${existingPeers.length} existing peers to ${userName}`);
      }
      
      // Notify others about new peer
      socket.to(sessionId).emit('new-peer', { 
        peerId: peerId, 
        name: userName, 
        isHost: user.isHost 
      });
      
      // Send complete user list to everyone (including new user)
      io.to(sessionId).emit('users-updated', connectedUsers);
      
      // Confirm successful join to new user
      socket.emit('join-success', {
        sessionId,
        isHost: user.isHost,
        connectedUsers,
        peerId: peerId,
        totalUsers: connectedUsers.length
      });

      console.log(`${userName} successfully joined session ${sessionId}. Total users: ${connectedUsers.length}. Is host: ${user.isHost}`);
      
    } catch (error) {
      console.error('Error in join-session:', error);
      socket.emit('error', 'Failed to join session');
    }
  });

  socket.on('chat-message', ({ sessionId, message, userName }) => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`Chat message in ${sessionId}: ${userName}: ${message}`);
      
      // Broadcast to all users in the session
      io.to(sessionId).emit('new-message', {
        userName,
        message,
        timestamp,
        userId: socket.id
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Host controls - ensure only host can use these
  socket.on('video-control', ({ sessionId, action }) => {
    const user = users.get(socket.id);
    if (user && user.isHost) {
      console.log(`Host ${user.name} video control: ${action}`);
      socket.to(sessionId).emit('host-video-control', { action });
    } else {
      socket.emit('error', 'Only host can control video');
    }
  });

  socket.on('audio-control', ({ sessionId, action }) => {
    const user = users.get(socket.id);
    if (user && user.isHost) {
      console.log(`Host ${user.name} audio control: ${action}`);
      socket.to(sessionId).emit('host-audio-control', { action });
    } else {
      socket.emit('error', 'Only host can control audio');
    }
  });

  // Screen sharing - only host can share
  socket.on('start-screen-share', ({ sessionId }) => {
    const user = users.get(socket.id);
    if (user && user.isHost) {
      console.log(`Host ${user.name} started screen sharing in ${sessionId}`);
      socket.to(sessionId).emit('host-screen-share-started', { 
        peerId: user.peerId,
        userName: user.name
      });
    } else {
      socket.emit('error', 'Only host can share screen');
    }
  });

  socket.on('stop-screen-share', ({ sessionId }) => {
    const user = users.get(socket.id);
    if (user && user.isHost) {
      console.log(`Host ${user.name} stopped screen sharing in ${sessionId}`);
      socket.to(sessionId).emit('host-screen-share-stopped', {
        peerId: user.peerId,
        userName: user.name
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      const session = sessions.get(user.sessionId);
      if (session) {
        console.log(`${user.name} left session ${user.sessionId}`);
        
        // Notify others about peer disconnection
        socket.to(user.sessionId).emit('peer-disconnected', { 
          peerId: user.peerId,
          userName: user.name 
        });
        
        if (user.isHost) {
          // Host disconnected
          session.host = null;
          console.log(`Host ${user.name} disconnected from session ${user.sessionId}`);
          
          // Promote first participant to host if any exist
          if (session.participants.length > 0) {
            const newHost = session.participants.shift();
            newHost.isHost = true;
            session.host = newHost;
            
            // Update the user in the users map
            users.set(newHost.id, newHost);
            
            const newHostSocket = [...io.sockets.sockets.values()]
              .find(s => s.id === newHost.id);
            
            if (newHostSocket) {
              newHostSocket.emit('promoted-to-host');
              newHostSocket.to(user.sessionId).emit('new-host', {
                peerId: newHost.peerId,
                userName: newHost.name
              });
            }
            
            console.log(`${newHost.name} promoted to host in session ${user.sessionId}`);
          } else {
            // No participants left, session becomes empty
            socket.to(user.sessionId).emit('host-disconnected');
          }
        } else {
          // Remove participant
          session.participants = session.participants.filter(p => p.id !== socket.id);
        }
        
        // Update session
        sessions.set(user.sessionId, session);
        
        // Update remaining users
        const connectedUsers = [session.host, ...session.participants].filter(u => u);
        io.to(user.sessionId).emit('users-updated', connectedUsers);
        
        // Clean up empty sessions
        if (connectedUsers.length === 0) {
          sessions.delete(user.sessionId);
          console.log(`Session ${user.sessionId} deleted (empty)`);
        }
      }
      
      users.delete(socket.id);
    }
  });

  // Handle socket errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Utility functions
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Debug function to log session states
function logSessionStates() {
  console.log('\n=== SESSION STATES ===');
  sessions.forEach((session, sessionId) => {
    console.log(`Session ${sessionId}:`);
    console.log(`  Host: ${session.host ? `${session.host.name} (${session.host.peerId})` : 'None'}`);
    console.log(`  Participants: ${session.participants.length}`);
    session.participants.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.name} (${p.peerId})`);
    });
  });
  console.log('=====================\n');
}

// Periodic cleanup of inactive sessions and debug logging
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    const timeDiff = now - session.createdAt;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Remove sessions older than 24 hours with no users
    if (hoursDiff > 24 && !session.host && session.participants.length === 0) {
      sessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
  
  // Log session states for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    logSessionStates();
  }
}, 60000); // Run every minute

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  try {
    await initializeDatabase();
    
    console.log(`Server running on port ${PORT}`);
    console.log(`WebRTC signaling server ready`);
    console.log(`PeerJS server running on http://localhost:${PORT}/peerjs`);
    console.log(`Socket.IO server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}
);