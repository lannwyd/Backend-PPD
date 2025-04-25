import express from "express";
import cors from "cors";
import sequelize from "./models/db.js";
import path from 'path';
import { fileURLToPath } from 'url';
import setupAssociations from './models/associations.js';
import cookieParser from "cookie-parser";


import studentRoutes from "./src/routes/studentRoutes.js";
import gradeRoutes from "./src/routes/gradeRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import occupationRoutes from "./src/routes/occupationRoutes.js";
import individualRoomRoutes from './src/routes/individualRoomRoutes.js';
import labRoutes from './src/routes/labRoutes.js';
import publicRoomRoutes from './src/routes/publicRoomRoutes.js';
import sessionHistoryRoutes from './src/routes/sessionHistoryRoutes.js';
import {getProfile, protect} from './src/controllers/authController.js';


import authRoutes from './src/routes/authRoutes.js';


const app = express();
// In server.js
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true,
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']

}));

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Add this line
app.use(express.json());
app.use((req, res, next) => {
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    next();
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cookieParser());


app.use('/api/students', studentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/occupations", occupationRoutes);
app.use('/api/individual-rooms', individualRoomRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/public-rooms', publicRoomRoutes);
app.use('/api/session-history', sessionHistoryRoutes);

app.use('/auth', authRoutes);



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


app.get('/Account-verification.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Account-verification.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile2.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile2.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});




async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        setupAssociations();

        await sequelize.sync({ alter: true });
        console.log('🔄 Database synchronized');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error("❌ Server startup failed:");
        console.error("- Verify all models are properly exported");
        console.error("- Check association definitions");
        console.error("- Ensure database credentials are correct");
        console.error("Full error:", error);
        process.exit(1);
    }
}
startServer();

process.on('SIGTERM', async () => {
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await sequelize.close();
    process.exit(0);
});