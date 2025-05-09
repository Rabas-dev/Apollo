import express from 'express';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get messages between two users
router.get('/:recipientId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: req.params.recipientId },
        { sender: req.params.recipientId, recipient: req.userId }
      ]
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');

    // Mark messages as read
    await Message.updateMany(
      {
        recipient: req.userId,
        sender: req.params.recipientId,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread messages count
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.userId,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 