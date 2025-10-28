const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByPatient,
  getTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  markTaskIncomplete,
  getTaskStats
} = require('../controllers/taskController');
const { authenticate, ensureRole } = require('../middleware/auth');
const { validateTask, validateObjectId, validatePatientId, validatePagination } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Create task (Caregiver only)
router.post('/', ensureRole('caregiver'), validateTask, createTask);

// Get tasks by patient
router.get('/patient/:patientId', validatePatientId, validatePagination, getTasksByPatient);

// Get task statistics for a patient
router.get('/patient/:patientId/stats', validatePatientId, getTaskStats);

// Get single task
router.get('/:id', validateObjectId, getTask);

// Update task (Caregiver only)
router.put('/:id', ensureRole('caregiver'), validateObjectId, updateTask);

// Delete task (Caregiver only)
router.delete('/:id', ensureRole('caregiver'), validateObjectId, deleteTask);

// Mark task as completed
router.post('/:id/complete', validateObjectId, markTaskCompleted);

// Mark task as incomplete
router.post('/:id/incomplete', validateObjectId, markTaskIncomplete);

module.exports = router;
