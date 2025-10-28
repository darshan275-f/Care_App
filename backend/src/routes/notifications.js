const express = require('express');
const router = express.Router();
const {
  createMedicationNotification,
  createTaskNotification,
  getNotificationsByPatient,
  markNotificationAsDelivered,
  deleteNotification,
  getTodayNotifications
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All routes are protected
router.use(authenticate);

// Routes
router.post('/medication/:medicationId', createMedicationNotification);
router.post('/task/:taskId', createTaskNotification);
router.get('/patient/:patientId', getNotificationsByPatient);
router.get('/today', getTodayNotifications);
router.put('/:id/delivered', markNotificationAsDelivered);
router.delete('/:id', deleteNotification);

module.exports = router;

