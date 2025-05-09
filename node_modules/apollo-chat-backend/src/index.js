import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const onlineUsers = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Expect client to emit 'user_online' with their userId after connecting
  socket.on('user_online', (userId) => {
    socket.userId = userId;
    onlineUsers.add(userId);
    io.emit('online_status', { userId, online: true });
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // For demo: broadcast the message to the room with all fields needed for the frontend
    io.to(data.roomId).emit('receive_message', {
      id: Date.now().toString(),
      sender: data.sender,
      recipient: data.recipient,
      content: data.message.content,
      plainText: data.message.plainText,
      timestamp: data.message.timestamp,
    });
  });

  // Typing indicator relay
  socket.on('typing', (data) => {
    // data: { roomId, userId }
    socket.to(data.roomId).emit('typing', { userId: data.userId });
  });
  socket.on('stop_typing', (data) => {
    // data: { roomId, userId }
    socket.to(data.roomId).emit('stop_typing', { userId: data.userId });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_status', { userId: socket.userId, online: false });
    }
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apollo-chat')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 