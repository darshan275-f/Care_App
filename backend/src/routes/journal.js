const express = require('express');
const router = express.Router();
const {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  addTag,
  removeTag,
  getMoodStats
} = require('../controllers/journalController');
const { authenticate } = require('../middleware/auth');
const { validateJournalEntry, validateObjectId, validatePatientId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Create journal entry
router.post('/', validateJournalEntry, createJournalEntry);

// Get journal entries for a patient
router.get('/patient/:patientId', validatePatientId, validatePagination, getJournalEntries);

// Get mood statistics for a patient
router.get('/patient/:patientId/mood-stats', validatePatientId, getMoodStats);

// Get single journal entry
router.get('/:id', validateObjectId, getJournalEntry);

// Update journal entry
router.put('/:id', validateObjectId, updateJournalEntry);

// Delete journal entry
router.delete('/:id', validateObjectId, deleteJournalEntry);

// Add tag to journal entry
router.post('/:id/tags', validateObjectId, addTag);

// Remove tag from journal entry
router.delete('/:id/tags/:tag', validateObjectId, removeTag);

module.exports = router;
