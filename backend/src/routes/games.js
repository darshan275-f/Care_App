const express = require('express');
const router = express.Router();
const {
  saveGameStats,
  getGameStats,
  getGameStat,
  getAverageScores,
  getProgressOverTime,
  getLeaderboard,
  getGameTypes
} = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');
const { validateGameStats, validateObjectId, validatePagination } = require('../middleware/validation');

// Public routes
router.get('/types', getGameTypes);

// All other routes require authentication
router.use(authenticate);

// Save game statistics
router.post('/stats', validateGameStats, saveGameStats);

// Get game statistics for a patient
router.get('/patient/:patientId/stats', validateObjectId, validatePagination, getGameStats);

// Get average scores for a patient
router.get('/patient/:patientId/average-scores', validateObjectId, getAverageScores);

// Get progress over time for a specific game type
router.get('/patient/:patientId/progress/:gameType', validateObjectId, getProgressOverTime);

// Get single game statistics entry
router.get('/stats/:id', validateObjectId, getGameStat);

// Get leaderboard for a specific game type
router.get('/leaderboard/:gameType', getLeaderboard);

module.exports = router;
