import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import studentRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';
import fileRoutes from './routes/fileRoutes';
import notificationRoutes from './routes/notificationRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import todoRoutes from './routes/todoRoutes';
import documentRoutes from './routes/documents';
import facultyRoutes from './routes/facultyRoutes';
import noticeRoutes from './routes/noticeRoutes';
import aiTipsRoutes from './routes/aiTipsRoutes';
import calendarRoutes from './routes/calendarRoutes';
import adminRoutes from './routes/adminRoutes';
import studyRoomRoutes from './routes/studyRoomRoutes';
import { initSchedulers } from './jobs/scheduler';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow frontend to connect
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// WebRTC Signaling Logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    // Tell others in the room that someone new joined
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', payload);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Broadcast to all rooms this user was in
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EduSphere AI Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/tips', aiTipsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/study-rooms', studyRoomRoutes);

// Database connection & Server start
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Start Cron jobs
    initSchedulers();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });
