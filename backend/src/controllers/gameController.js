const GameStats = require('../models/GameStats');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Save game statistics
// @route   POST /api/games/stats
// @access  Private
const saveGameStats = asyncHandler(async (req, res) => {
  const { 
    patientId, 
    gameType, 
    score, 
    maxScore, 
    duration, 
    level, 
    difficulty, 
    accuracy, 
    attempts, 
    hintsUsed, 
    notes 
  } = req.body;

  // If user is a patient, they can only save stats for themselves
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only save game statistics for themselves'
    });
  }

  // If user is a caregiver, check if they're linked to the patient
  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const gameStats = await GameStats.create({
    patientId,
    gameType,
    score,
    maxScore,
    duration,
    level,
    difficulty,
    accuracy,
    attempts,
    hintsUsed,
    notes
  });

  logger.info(`Game statistics saved: ${gameType} for patient ${patientId}`);

  res.status(201).json({
    success: true,
    message: 'Game statistics saved successfully',
    data: {
      gameStats: gameStats.toObject()
    }
  });
});

// @desc    Get game statistics for a patient
// @route   GET /api/games/patient/:patientId/stats
// @access  Private (Patient or linked Caregiver)
const getGameStats = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { gameType, days = 30, page = 1, limit = 20 } = req.query;

  // Check access permissions
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only view their own game statistics'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const options = { gameType, days: parseInt(days) };
  const stats = await GameStats.getPatientStats(patientId, options);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedStats = stats.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      stats: paginatedStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(stats.length / limit),
        totalStats: stats.length,
        hasNext: endIndex < stats.length,
        hasPrev: startIndex > 0
      }
    }
  });
});

// @desc    Get single game statistics entry
// @route   GET /api/games/stats/:id
// @access  Private (Patient or linked Caregiver)
const getGameStat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const gameStat = await GameStats.findById(id)
    .populate('patientId', 'name username');

  if (!gameStat) {
    return res.status(404).json({
      success: false,
      message: 'Game statistics not found'
    });
  }

  // Check access permissions
  if (req.user.role === 'patient' && gameStat.patientId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own game statistics.'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === gameStat.patientId._id.toString()
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  res.json({
    success: true,
    data: {
      gameStat
    }
  });
});

// @desc    Get average scores by game type
// @route   GET /api/games/patient/:patientId/average-scores
// @access  Private (Patient or linked Caregiver)
const getAverageScores = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { days = 30 } = req.query;

  // Check access permissions
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only view their own game statistics'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const averageScores = await GameStats.getAverageScores(patientId, parseInt(days));

  res.json({
    success: true,
    data: {
      averageScores,
      period: `${days} days`
    }
  });
});

// @desc    Get progress over time for a specific game type
// @route   GET /api/games/patient/:patientId/progress/:gameType
// @access  Private (Patient or linked Caregiver)
const getProgressOverTime = asyncHandler(async (req, res) => {
  const { patientId, gameType } = req.params;
  const { days = 30 } = req.query;

  // Check access permissions
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only view their own game statistics'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const progressData = await GameStats.getProgressOverTime(patientId, gameType, parseInt(days));

  res.json({
    success: true,
    data: {
      gameType,
      progressData,
      period: `${days} days`
    }
  });
});

// @desc    Get leaderboard for a specific game type
// @route   GET /api/games/leaderboard/:gameType
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const { gameType } = req.params;
  const { days = 7, limit = 10 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const leaderboard = await GameStats.aggregate([
    {
      $match: {
        gameType,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$patientId',
        bestScore: { $max: '$score' },
        averageScore: { $avg: '$score' },
        totalGames: { $sum: 1 },
        bestPercentage: { $max: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'patient'
      }
    },
    {
      $unwind: '$patient'
    },
    {
      $project: {
        patientId: '$_id',
        patientName: '$patient.name',
        bestScore: 1,
        averageScore: { $round: ['$averageScore', 2] },
        totalGames: 1,
        bestPercentage: { $round: ['$bestPercentage', 2] }
      }
    },
    {
      $sort: { bestPercentage: -1, bestScore: -1 }
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  res.json({
    success: true,
    data: {
      gameType,
      leaderboard,
      period: `${days} days`
    }
  });
});

// @desc    Get available game types
// @route   GET /api/games/types
// @access  Public
const getGameTypes = asyncHandler(async (req, res) => {
  const gameTypes = [
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Match pairs of cards to improve memory',
      difficulty: ['easy', 'medium', 'hard']
    },
    {
      id: 'sequence-recall',
      name: 'Sequence Recall',
      description: 'Remember and repeat sequences',
      difficulty: ['easy', 'medium', 'hard']
    },
    {
      id: 'word-association',
      name: 'Word Association',
      description: 'Connect related words to improve cognitive function',
      difficulty: ['easy', 'medium', 'hard']
    },
    {
      id: 'number-sequence',
      name: 'Number Sequence',
      description: 'Complete number patterns',
      difficulty: ['easy', 'medium', 'hard']
    },
    {
      id: 'color-match',
      name: 'Color Match',
      description: 'Match colors and patterns',
      difficulty: ['easy', 'medium', 'hard']
    }
  ];

  res.json({
    success: true,
    data: {
      gameTypes
    }
  });
});

module.exports = {
  saveGameStats,
  getGameStats,
  getGameStat,
  getAverageScores,
  getProgressOverTime,
  getLeaderboard,
  getGameTypes
};
