// At the top with other imports
import { uploadProfilePicture } from './src/controllers/userController.js';
import express from "express";
import cors from "cors";
import sequelize from "./models/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import setupAssociations from './models/associations.js';
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createServer } from "http";

import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Routes
import historyRoutes from "./src/routes/historyRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js";

import sessionRoutes from "./src/routes/sessionRoutes.js";
import joinedUsersRoutes from "./src/routes/joinedUsersRoutes.js";

import authRoutes from './src/routes/authRoutes.js';
import * as userController from "./src/controllers/userController.js";
import {protect} from "./src/controllers/authController.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create directory if it doesn't exist
        const dest = path.join(__dirname, 'public', 'uploads', 'profile_pictures');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Security middleware

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.socket.io",
           "https://cdn.tailwindcss.com",
            "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://cdn.tailwindcss.com"
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
          
        ],
        connectSrc: [
          "'self'",
          "http://localhost:4000",
          "ws://localhost:4000",
          "http://localhost:3000",
          "https://res.cloudinary.com/" ,
            "https://lottie.host",
        ],
        workerSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
      },
    },
  })
);



// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection and role seeding
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        setupAssociations();

        
        await sequelize.sync({  alter: false });
        console.log('🔄 Database synchronized');

        // Seed initial roles if they don't exist
        const { Role } = sequelize.models;
        await Role.findOrCreate({ where: { role_label: 'student' } });
        await Role.findOrCreate({ where: { role_label: 'teacher' } });
        console.log('🔒 Base roles seeded');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// API Routes
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

app.use('/api/sessions', sessionRoutes);
app.use('/api/members', joinedUsersRoutes);

app.use('/auth', authRoutes);

// HTML Routes
const htmlRoutes = [
    '/', '/login', '/register', '/dashboard',
    '/profile', '/Account-verification',"/LabRoom",
    '/history', '/history/teacher'
];

htmlRoutes.forEach(route => {
    app.get(route, (req, res) => {
        const file = route === '/' ? 'Home.html' :
            route === '/history/teacher' ? 'HistoryTeacher.html' :
                `${route.replace('/', '')}.html`;
        res.sendFile(path.join(__dirname, 'public', file));
    });
});
app.patch('/api/users/upload-profile-picture',
    protect,
    upload.single('profilePicture'),
    userController.uploadProfilePicture
);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});



// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Create HTTP and WebSocket server
const httpServer = createServer(app);


// Start server
async function startServer() {
    try {
        await initializeDatabase();

        const PORT = process.env.PORT || 5000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 WebSocket server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await sequelize.close();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await sequelize.close();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
})

startServer();