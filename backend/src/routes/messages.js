const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');

// Basic chat endpoints (no sockets)
router.post('/sendMessage', sendMessage);
router.get('/getMessages', getMessages);

module.exports = router;


