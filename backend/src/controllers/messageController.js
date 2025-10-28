const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: 'senderId, receiverId and content are required' });
    }

    const message = await Message.create({ senderId, receiverId, content });
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2, limit = 100 } = req.query;
    if (!user1 || !user2) {
      return res.status(400).json({ success: false, message: 'user1 and user2 are required' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};


