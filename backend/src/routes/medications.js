const express = require('express');
const router = express.Router();
const {
  createMedication,
  getMedicationsByPatient,
  getMedication,
  updateMedication,
  deleteMedication,
  getMedicationStats
} = require('../controllers/medicationController');
const { authenticate, ensureRole } = require('../middleware/auth');
const { validateMedication, validateObjectId, validatePatientId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Create medication (Caregiver only)
router.post('/', ensureRole('caregiver'), validateMedication, createMedication);

// Get medications by patient
router.get('/patient/:patientId', validatePatientId, getMedicationsByPatient);

// Get single medication
router.get('/:id', validateObjectId, getMedication);

// Update medication (Caregiver only)
router.put('/:id', ensureRole('caregiver'), validateObjectId, updateMedication);

// Delete medication (Caregiver only)
router.delete('/:id', ensureRole('caregiver'), validateObjectId, deleteMedication);

// Get medication statistics
router.get('/:id/stats', validateObjectId, getMedicationStats);

module.exports = router;
