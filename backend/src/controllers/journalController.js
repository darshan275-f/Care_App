const JournalEntry = require('../models/JournalEntry');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Create new journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = asyncHandler(async (req, res) => {
  const { patientId, text, imageUrl, mood, tags, isPrivate } = req.body;
  const authorId = req.user._id;

  // If user is a patient, they can only create entries for themselves
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only create journal entries for themselves'
    });
  }

  // If user is a caregiver, check if they're linked to the patient
  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId._id.toString() === patientId || linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const journalEntry = await JournalEntry.create({
    patientId,
    authorId,
    text,
    imageUrl,
    mood,
    tags: tags || [],
    isPrivate: isPrivate || false
  });

  await journalEntry.populate('authorId', 'name role');

  logger.info(`New journal entry created for patient ${patientId} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Journal entry created successfully',
    data: {
      entry: journalEntry.toObject()
    }
  });
});

// @desc    Get journal entries for a patient
// @route   GET /api/journal/patient/:patientId
// @access  Private (Patient or linked Caregiver)
const getJournalEntries = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { 
    mood, 
    authorId, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  // Check access permissions
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only view their own journal entries'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId._id.toString() === patientId || linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

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

// @desc    Get single journal entry
// @route   GET /api/journal/:id
// @access  Private (Patient or linked Caregiver)
const getJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await JournalEntry.findById(id)
    .populate('patientId', 'name username')
    .populate('authorId', 'name role');

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found'
    });
  }

  // Check access permissions
  if (req.user.role === 'patient' && entry.patientId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own journal entries.'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId.toString() === entry.patientId._id.toString()
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
      entry
    }
  });
});

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Private (Author only)
const updateJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, imageUrl, mood, tags, isPrivate } = req.body;

  const entry = await JournalEntry.findById(id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found'
    });
  }

  // Only the author can update the entry
  if (entry.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own journal entries.'
    });
  }

  // Update fields
  if (text !== undefined) entry.text = text;
  if (imageUrl !== undefined) entry.imageUrl = imageUrl;
  if (mood !== undefined) entry.mood = mood;
  if (tags !== undefined) entry.tags = tags;
  if (isPrivate !== undefined) entry.isPrivate = isPrivate;

  await entry.save();
  await entry.populate('authorId', 'name role');

  logger.info(`Journal entry updated: ${entry._id}`);

  res.json({
    success: true,
    message: 'Journal entry updated successfully',
    data: {
      entry: entry.toObject()
    }
  });
});

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private (Author only)
const deleteJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await JournalEntry.findById(id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found'
    });
  }

  // Only the author can delete the entry
  if (entry.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own journal entries.'
    });
  }

  // Soft delete by setting isActive to false
  entry.isActive = false;
  await entry.save();

  logger.info(`Journal entry deleted: ${entry._id}`);

  res.json({
    success: true,
    message: 'Journal entry deleted successfully'
  });
});

// @desc    Add tag to journal entry
// @route   POST /api/journal/:id/tags
// @access  Private (Author only)
const addTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;

  if (!tag || tag.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Tag is required'
    });
  }

  const entry = await JournalEntry.findById(id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found'
    });
  }

  // Only the author can add tags
  if (entry.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own journal entries.'
    });
  }

  await entry.addTag(tag.trim());

  res.json({
    success: true,
    message: 'Tag added successfully',
    data: {
      entry: entry.toObject()
    }
  });
});

// @desc    Remove tag from journal entry
// @route   DELETE /api/journal/:id/tags/:tag
// @access  Private (Author only)
const removeTag = asyncHandler(async (req, res) => {
  const { id, tag } = req.params;

  const entry = await JournalEntry.findById(id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Journal entry not found'
    });
  }

  // Only the author can remove tags
  if (entry.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own journal entries.'
    });
  }

  await entry.removeTag(tag);

  res.json({
    success: true,
    message: 'Tag removed successfully',
    data: {
      entry: entry.toObject()
    }
  });
});

// @desc    Get mood statistics for a patient
// @route   GET /api/journal/patient/:patientId/mood-stats
// @access  Private (Patient or linked Caregiver)
const getMoodStats = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { days = 30 } = req.query;

  // Check access permissions
  if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Patients can only view their own mood statistics'
    });
  }

  if (req.user.role === 'caregiver') {
    const isLinked = req.user.linkedPatients.some(linkedPatientId => 
      linkedPatientId._id.toString() === patientId || linkedPatientId.toString() === patientId
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  const moodStats = await JournalEntry.getMoodStats(patientId, parseInt(days));

  res.json({
    success: true,
    data: {
      moodStats,
      period: `${days} days`
    }
  });
});

module.exports = {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  addTag,
  removeTag,
  getMoodStats
};
