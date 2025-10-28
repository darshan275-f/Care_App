const Medication = require('../models/Medication');
const Task = require('../models/Task');
const JournalEntry = require('../models/JournalEntry');
const GameStats = require('../models/GameStats');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Get patient dashboard data
// @route   GET /api/patients/:id/dashboard
// @access  Private (Patient or linked Caregiver)
const getDashboard = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's medications
  const medications = await Medication.find({ 
    patientId, 
    isActive: true 
  });

  const medicationStats = medications.map(med => {
    const todayStatus = med.getTodayStatus();
    return {
      _id: med._id,
      name: med.name,
      dosage: med.dosage,
      status: todayStatus.status,
      taken: todayStatus.taken,
      skipped: todayStatus.skipped,
      takenAt: todayStatus.takenAt
    };
  });

  const takenCount = medicationStats.filter(m => m.taken).length;
  const totalCount = medicationStats.length;
  const medicationPercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Get all active tasks
  const tasks = await Task.find({
    patientId,
    isActive: true,
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get recent journal entries
  const recentJournalEntries = await JournalEntry.find({
    patientId,
    isActive: true
  })
  .populate('authorId', 'name role')
  .sort({ createdAt: -1 })
  .limit(3);

  // Get recent game stats
  const recentGameStats = await GameStats.find({
    patientId
  })
  .sort({ date: -1 })
  .limit(5);

  // Get mood statistics for the last 7 days
  const moodStats = await JournalEntry.getMoodStats(patientId, 7);

  // Calculate overall progress
  const overallProgress = Math.round((medicationPercentage + taskPercentage) / 2);

  res.json({
    success: true,
    data: {
      medicationStats: {
        percentage: medicationPercentage,
        taken: takenCount,
        total: totalCount,
        medications: medicationStats
      },
      taskStats: {
        percentage: taskPercentage,
        completed: completedTasks,
        total: tasks.length,
        tasks: tasks.slice(0, 5) // Show first 5 tasks
      },
      recentJournalEntries,
      recentGameStats,
      moodStats,
      overallProgress
    }
  });
});

// @desc    Get patient medications
// @route   GET /api/patients/:id/medications
// @access  Private (Patient or linked Caregiver)
const getMedications = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const { date } = req.query;

  const query = { patientId, isActive: true };
  
  const medications = await Medication.find(query).sort({ name: 1 });

  // If date is provided, get status for that specific date
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const medicationsWithStatus = medications.map(med => {
      const statusEntry = med.takenDates.find(entry => 
        entry.date.getTime() === targetDate.getTime()
      );

      return {
        ...med.toObject(),
        todayStatus: statusEntry ? {
          taken: statusEntry.taken,
          skipped: statusEntry.skipped,
          takenAt: statusEntry.takenAt,
          notes: statusEntry.notes
        } : {
          taken: false,
          skipped: false,
          takenAt: null,
          notes: ''
        }
      };
    });

    return res.json({
      success: true,
      data: {
        medications: medicationsWithStatus,
        date: targetDate
      }
    });
  }

  // Default to today's status
  const medicationsWithTodayStatus = medications.map(med => {
    const todayStatus = med.getTodayStatus();
    return {
      ...med.toObject(),
      todayStatus
    };
  });

  res.json({
    success: true,
    data: {
      medications: medicationsWithTodayStatus
    }
  });
});

// @desc    Mark medication as taken
// @route   POST /api/patients/:id/medications/:medId/taken
// @access  Private (Patient or linked Caregiver)
const markMedicationTaken = asyncHandler(async (req, res) => {
  const { id: patientId, medId } = req.params;
  const { notes } = req.body;
  const date = req.body.date || new Date();

  const medication = await Medication.findOne({
    _id: medId,
    patientId,
    isActive: true
  });

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  await medication.markTaken(date, notes);

  logger.info(`Medication ${medication.name} marked as taken for patient ${patientId}`);

  res.json({
    success: true,
    message: 'Medication marked as taken',
    data: {
      medication: medication.toObject()
    }
  });
});

// @desc    Mark medication as skipped
// @route   POST /api/patients/:id/medications/:medId/skipped
// @access  Private (Patient or linked Caregiver)
const markMedicationSkipped = asyncHandler(async (req, res) => {
  const { id: patientId, medId } = req.params;
  const { notes } = req.body;
  const date = req.body.date || new Date();

  const medication = await Medication.findOne({
    _id: medId,
    patientId,
    isActive: true
  });

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  await medication.markSkipped(date, notes);

  logger.info(`Medication ${medication.name} marked as skipped for patient ${patientId}`);

  res.json({
    success: true,
    message: 'Medication marked as skipped',
    data: {
      medication: medication.toObject()
    }
  });
});

// @desc    Get patient tasks
// @route   GET /api/patients/:id/tasks
// @access  Private (Patient or linked Caregiver)
const getTasks = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const { completed, category, priority, page = 1, limit = 20 } = req.query;

  const options = {
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
    category,
    priority
  };

  const tasks = await Task.getPatientTasks(patientId, options);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      tasks: paginatedTasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(tasks.length / limit),
        totalTasks: tasks.length,
        hasNext: endIndex < tasks.length,
        hasPrev: startIndex > 0
      }
    }
  });
});

// @desc    Mark task as completed
// @route   POST /api/patients/:id/tasks/:taskId/complete
// @access  Private (Patient or linked Caregiver)
const markTaskCompleted = asyncHandler(async (req, res) => {
  const { id: patientId, taskId } = req.params;
  const { notes } = req.body;

  const task = await Task.findOne({
    _id: taskId,
    patientId,
    isActive: true
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await task.markCompleted(notes);

  logger.info(`Task ${task.title} marked as completed for patient ${patientId}`);

  res.json({
    success: true,
    message: 'Task marked as completed',
    data: {
      task: task.toObject()
    }
  });
});

// @desc    Get patient journal entries
// @route   GET /api/patients/:id/journal
// @access  Private (Patient or linked Caregiver)
const getJournalEntries = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const { 
    mood, 
    authorId, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  const options = {
    mood,
    authorId,
    startDate,
    endDate,
    limit: parseInt(limit)
  };

  const entries = await JournalEntry.getPatientEntries(patientId, options);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      entries: paginatedEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(entries.length / limit),
        totalEntries: entries.length,
        hasNext: endIndex < entries.length,
        hasPrev: startIndex > 0
      }
    }
  });
});

// @desc    Get patient game statistics
// @route   GET /api/patients/:id/games/stats
// @access  Private (Patient or linked Caregiver)
const getGameStats = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const { gameType, days = 30 } = req.query;

  const options = { gameType, days: parseInt(days) };
  const stats = await GameStats.getPatientStats(patientId, options);
  const averageScores = await GameStats.getAverageScores(patientId, parseInt(days));

  res.json({
    success: true,
    data: {
      recentStats: stats.slice(0, 10),
      averageScores,
      totalGames: stats.length
    }
  });
});

module.exports = {
  getDashboard,
  getMedications,
  markMedicationTaken,
  markMedicationSkipped,
  getTasks,
  markTaskCompleted,
  getJournalEntries,
  getGameStats
};
