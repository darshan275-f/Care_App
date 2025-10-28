const express = require('express');
const router = express.Router();
const { getToday } = require('../controllers/healthController');

// GET /api/healthData?userId=<id>
router.get('/healthData', getToday);

module.exports = router;


