const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getMedications,
  markMedicationTaken,
  markMedicationSkipped,
  getTasks,
  markTaskCompleted,
  getJournalEntries,
  getGameStats
} = require('../controllers/patientController');
const { authenticate, ensurePatientAccess } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Dashboard route
router.get('/:id/dashboard', validateObjectId, ensurePatientAccess, getDashboard);

// Medication routes
router.get('/:id/medications', validateObjectId, ensurePatientAccess, getMedications);
router.post('/:id/medications/:medId/taken', validateObjectId, ensurePatientAccess, markMedicationTaken);
router.post('/:id/medications/:medId/skipped', validateObjectId, ensurePatientAccess, markMedicationSkipped);

// Task routes
router.get('/:id/tasks', validateObjectId, ensurePatientAccess, validatePagination, getTasks);
router.post('/:id/tasks/:taskId/complete', validateObjectId, ensurePatientAccess, markTaskCompleted);

// Journal routes
router.get('/:id/journal', validateObjectId, ensurePatientAccess, validatePagination, getJournalEntries);

// Game statistics routes
router.get('/:id/games/stats', validateObjectId, ensurePatientAccess, getGameStats);

module.exports = router;
