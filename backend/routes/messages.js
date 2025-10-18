import express from 'express';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all chat titles for a user
router.get('/titles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Handle both ObjectId and string user IDs
    let query = { sender: userId };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { sender: new mongoose.Types.ObjectId(userId) };
    }

    const titles = await Message.aggregate([
      { $match: query },
      { $group: { _id: '$chat_title', lastMessage: { $max: '$timestamp' } } },
      { $sort: { lastMessage: -1 } },
      { $project: { _id: 0, title: '$_id', lastMessage: 1 } }
    ]);

    res.json(titles);
  } catch (error) {
    console.error('Error fetching chat titles:', error);
    res.status(500).json({ error: 'Failed to fetch chat titles' });
  }
});

// Get messages for a specific chat title
router.get('/chat/:userId/:title', async (req, res) => {
  try {
    const { userId, title } = req.params;
    
    // Query for messages in this chat title, including both user and bot messages
    const query = { 
      chat_title: decodeURIComponent(title),
      $or: [
        { sender: userId },
        { sender: "bot" }
      ]
    };

    console.log('Querying messages with:', query);
    const messages = await Message.find(query).sort({ sequence: 1 });
    console.log('Found messages:', messages.length);
    console.log('Messages:', messages.map(m => ({ id: m._id, sender: m.sender, sequence: m.sequence, content: m.content.substring(0, 50) + '...' })));

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Save a new message
router.post('/', async (req, res) => {
  try {
    const { chat_title, sender, content, has_code, sequence } = req.body;

    if (!chat_title || !sender || !content || sequence === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      chat_title,
      sender: sender, // Store as string, not ObjectId
      content,
      has_code: has_code || false,
      sequence
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Save multiple messages (for user message + AI response)
router.post('/batch', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate all messages
    for (const msg of messages) {
      if (!msg.chat_title || !msg.sender || !msg.content || msg.sequence === undefined) {
        return res.status(400).json({ error: 'Missing required fields in message' });
      }
    }

    const savedMessages = await Message.insertMany(messages);
    res.status(201).json(savedMessages);
  } catch (error) {
    console.error('Error saving messages:', error);
    res.status(500).json({ error: 'Failed to save messages' });
  }
});

// Delete a chat title and all its messages
router.delete('/chat/:userId/:title', async (req, res) => {
  try {
    const { userId, title } = req.params;
    
    // Handle both ObjectId and string user IDs
    let query = { 
      sender: userId,
      chat_title: decodeURIComponent(title)
    };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { 
        sender: new mongoose.Types.ObjectId(userId),
        chat_title: decodeURIComponent(title)
      };
    }

    const result = await Message.deleteMany(query);

    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router;
