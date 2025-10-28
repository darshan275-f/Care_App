const express = require('express');
const router = express.Router();
const { getDailyTip } = require('../controllers/tipController');

router.get('/dailyTip', getDailyTip);

module.exports = router;


