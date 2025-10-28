const mongoose = require('mongoose');

const gameStatsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  gameType: {
    type: String,
    required: [true, 'Game type is required'],
    enum: ['memory-match', 'sequence-recall', 'word-association', 'number-sequence', 'color-match']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  maxScore: {
    type: Number,
    required: [true, 'Max score is required'],
    min: [1, 'Max score must be at least 1']
  },
  duration: {
    type: Number, // in seconds
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 second']
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Level must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  accuracy: {
    type: Number,
    min: [0, 'Accuracy cannot be negative'],
    max: [100, 'Accuracy cannot exceed 100']
  },
  attempts: {
    type: Number,
    default: 1,
    min: [1, 'Attempts must be at least 1']
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: [0, 'Hints used cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
gameStatsSchema.index({ patientId: 1, date: -1 });
gameStatsSchema.index({ gameType: 1 });
gameStatsSchema.index({ score: -1 });

// Method to calculate percentage score
gameStatsSchema.methods.getPercentageScore = function() {
  return Math.round((this.score / this.maxScore) * 100);
};

// Method to get performance rating
gameStatsSchema.methods.getPerformanceRating = function() {
  const percentage = this.getPercentageScore();
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'fair';
  if (percentage >= 40) return 'needs-improvement';
  return 'poor';
};

// Static method to get patient's game statistics
gameStatsSchema.statics.getPatientStats = function(patientId, options = {}) {
  const query = { patientId };
  
  if (options.gameType) {
    query.gameType = options.gameType;
  }
  
  if (options.days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - options.days);
    query.date = { $gte: startDate };
  }
  
  return this.find(query).sort({ date: -1 }).limit(options.limit || 100);
};

// Static method to get average scores by game type
gameStatsSchema.statics.getAverageScores = function(patientId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        patientId: mongoose.Types.ObjectId(patientId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$gameType',
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] } },
        totalGames: { $sum: 1 },
        bestScore: { $max: '$score' },
        averageDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { averagePercentage: -1 }
    }
  ]);
};

// Static method to get progress over time
gameStatsSchema.statics.getProgressOverTime = function(patientId, gameType, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        patientId: mongoose.Types.ObjectId(patientId),
        gameType: gameType,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        averageScore: { $avg: '$score' },
        averagePercentage: { $avg: { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] } },
        gamesPlayed: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

module.exports = mongoose.model('GameStats', gameStatsSchema);
