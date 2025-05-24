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
import cookieParser from "cookie-parser";
import JoinedUsers from "./models/JoinedUsers.js";
import { protect } from "./src/controllers/authController.js";
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    setupAssociations();
    await sequelize.sync({ alter: true });
    
    const { Role } = sequelize.models;
    await Role.findOrCreate({ where: { role_label: "student" } });
    await Role.findOrCreate({ where: { role_label: "teacher" } });
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:4000'],
  credentials: true    
}));

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peerjs', peerServer);

const sessions = new Map();
const users = new Map();



let user;
app.post('/create-session', protect, async (req, res) => {
  try {
    const { sessionName, description } = req.body;
    user = req.user;
    
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
      session_end_time: 1
    });

    res.json({ sessionId, message: 'Session created successfully' });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/:sessionId', protect, async (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    res.sendFile(path.join(__dirname, 'public', 'meeting.html'));
    await JoinedUsers.create({
      user_id: req.user.user_id,
      session_id: sessionId,
    });
  } else {
    res.status(404).send('Session not found');
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', ({ sessionId, userName, peerId }) => {
    try {
      console.log(`User ${userName} (${socket.id}) joining session ${sessionId} with peer ID ${peerId}`);
      
      if (!sessions.has(sessionId)) {
        socket.emit('error', 'Session not found');
        return;
      }

      const session = sessions.get(sessionId);
      

      if (users.has(socket.id)) {
        console.log('User already exists, skipping...');
        return;
      }

      const shouldBeHost = !session.host && session.participants.length === 0;
      
      const user = {
        id: socket.id,
        name: userName,
        isHost: shouldBeHost,
        sessionId: sessionId,
        peerId: peerId,
        joinedAt: new Date()
      };

      socket.join(sessionId);
      users.set(socket.id, user);

   
      if (shouldBeHost) {
        session.host = user;
        socket.emit('host-privileges', true);
        console.log(`${userName} is now the host`);
      } else {
        session.participants.push(user);
        socket.emit('viewer-mode', true);
        console.log(`${userName} joined as participant`);
      }

      sessions.set(sessionId, session);

      const connectedUsers = [session.host, ...session.participants].filter(u => u);
      
     
      const existingPeers = connectedUsers
        .filter(u => u.id !== socket.id && u.peerId)
        .map(u => ({ 
          peerId: u.peerId, 
          name: u.name, 
          isHost: u.isHost 
        }));
      
      if (existingPeers.length > 0) {
        console.log(`Sending ${existingPeers.length} existing peers to ${userName}`);
        socket.emit('existing-peers', existingPeers);
      }

      socket.to(sessionId).emit('new-peer', { 
        peerId: peerId, 
        name: userName, 
        isHost: user.isHost 
      });
   
      io.to(sessionId).emit('users-updated', connectedUsers);
      
     
      socket.emit('join-success', {
        sessionId,
        isHost: user.isHost,
        connectedUsers,
        peerId: peerId,
        totalUsers: connectedUsers.length
      });

      console.log(`Session ${sessionId} now has ${connectedUsers.length} users`);
      
    } catch (error) {
      console.error('Error in join-session:', error);
      socket.emit('error', 'Failed to join session');
    }
  });

  socket.on('chat-message', ({ sessionId, message, userName }) => {
    try {
      const timestamp = new Date().toLocaleTimeString();
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

  socket.on('start-screen-share', ({ sessionId }) => {
    const user = users.get(socket.id);
    if (user && user.isHost) {
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
      socket.to(sessionId).emit('host-screen-share-stopped', {
        peerId: user.peerId,
        userName: user.name
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      const session = sessions.get(user.sessionId);
      if (session) {
     
        socket.to(user.sessionId).emit('peer-disconnected', { 
          peerId: user.peerId,
          userName: user.name 
        });
        
        if (user.isHost) {
          session.host = null;
   
          if (session.participants.length > 0) {
            const newHost = session.participants.shift();
            newHost.isHost = true;
            session.host = newHost;
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
          } else {
            socket.to(user.sessionId).emit('host-disconnected');
          }
        } else {
          session.participants = session.participants.filter(p => p.id !== socket.id);
        }
        
        sessions.set(user.sessionId, session);
        
        const connectedUsers = [session.host, ...session.participants].filter(u => u);
        io.to(user.sessionId).emit('users-updated', connectedUsers);
        
        if (connectedUsers.length === 0) {
          sessions.delete(user.sessionId);
          console.log(`Session ${user.sessionId} deleted - no users remaining`);
        }
      }
      
      users.delete(socket.id);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

function generateSessionId() {
  return crypto.randomUUID(); 
}


setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    const timeDiff = now - session.createdAt;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 24 && !session.host && session.participants.length === 0) {
      sessions.delete(sessionId);
    }
  }
}, 60000);

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
  
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});