const Notification = require('../models/Notification');
const Medication = require('../models/Medication');
const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Create notification for medication
// @route   POST /api/notifications/medication/:medicationId
// @access  Private (Caregiver only)
const createMedicationNotification = asyncHandler(async (req, res) => {
  const { medicationId } = req.params;
  const { notificationTime, recurring } = req.body;
  
  const medication = await Medication.findById(medicationId);
  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  // Check authorization
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === medication.patientId.toString()
    );
    
    if (!isLinked && medication.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create notifications for your linked patients.'
      });
    }
  }

  // Create notifications for each scheduled time
  const notifications = [];
  
  for (const time of medication.schedule.times) {
    const today = new Date();
    
    // For recurring notifications, create for the next 30 days
    const daysToSchedule = recurring?.type === 'daily' ? 30 : 1;
    
    for (let i = 0; i < daysToSchedule; i++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(scheduledDate.getDate() + i);
      scheduledDate.setHours(0, 0, 0, 0);
      
      // If using custom notification time from request
      const hour = notificationTime?.hour ?? time.hour;
      const minute = notificationTime?.minute ?? time.minute;
      
      const notification = await Notification.create({
        patientId: medication.patientId,
        medicationId: medication._id,
        type: 'medication',
        title: `Medication Reminder: ${medication.name}`,
        message: `Time to take ${medication.name} (${medication.dosage})`,
        scheduledDate,
        notificationTime: { hour, minute },
        isActive: true,
        isDelivered: false,
        recurring: recurring || { type: 'none', days: [] },
        createdBy: user._id
      });
      
      notifications.push(notification);
    }
  }

  logger.info(`Created ${notifications.length} notifications for medication ${medicationId}`);

  res.status(201).json({
    success: true,
    message: 'Notifications created successfully',
    data: {
      notifications,
      count: notifications.length
    }
  });
});

// @desc    Create notification for task
// @route   POST /api/notifications/task/:taskId
// @access  Private (Caregiver only)
const createTaskNotification = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { notificationTime } = req.body;
  
  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check authorization
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === task.patientId.toString()
    );
    
    if (!isLinked && task.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create notifications for your linked patients.'
      });
    }
  }

  // Parse the task due date
  const taskDate = new Date(task.dueDate);
  const taskDateTime = new Date(taskDate);
  
  // Use provided notification time or default to task due time
  if (notificationTime) {
    taskDateTime.setHours(notificationTime.hour, notificationTime.minute, 0, 0);
  } else {
    taskDateTime.setHours(9, 0, 0, 0); // Default to 9 AM
  }

  const notification = await Notification.create({
    patientId: task.patientId,
    taskId: task._id,
    type: 'task',
    title: `Task Reminder: ${task.title}`,
    message: task.description || `Don't forget to complete: ${task.title}`,
    scheduledDate: taskDate,
    notificationTime: {
      hour: notificationTime?.hour ?? 9,
      minute: notificationTime?.minute ?? 0
    },
    isActive: true,
    isDelivered: false,
    recurring: { type: 'none', days: [] },
    createdBy: user._id
  });

  logger.info(`Created notification for task ${taskId}`);

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: {
      notification
    }
  });
});

// @desc    Get all notifications for a patient
// @route   GET /api/notifications/patient/:patientId
// @access  Private (Patient or linked Caregiver)
const getNotificationsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { isActive = true, upcoming = false } = req.query;
  const user = req.user;

  // Authorization
  if (user.role === 'patient' && user._id.toString() !== patientId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own notifications.',
    });
  }

  if (user.role === 'caregiver' && !user.linkedPatients.some(p => p._id.toString() === patientId || p.toString() === patientId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this patient.',
    });
  }

  let query = {
    patientId,
    isActive: isActive === 'true'
  };

  // Get only upcoming notifications if requested
  if (upcoming === 'true') {
    const now = new Date();
    query.scheduledDate = { $gte: now };
    query.isDelivered = false;
  }

  const notifications = await Notification.find(query)
    .populate('medicationId', 'name dosage')
    .populate('taskId', 'title description')
    .populate('createdBy', 'name role')
    .sort({ scheduledDate: 1, 'notificationTime.hour': 1, 'notificationTime.minute': 1 });

  res.json({
    success: true,
    data: {
      notifications,
      count: notifications.length
    },
  });
});

// @desc    Mark notification as delivered
// @route   PUT /api/notifications/:id/delivered
// @access  Private (Patient or linked Caregiver)
const markNotificationAsDelivered = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Authorization
  const user = req.user;
  if (user.role === 'patient' && notification.patientId.toString() !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }

  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === notification.patientId.toString()
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }
  }

  notification.isDelivered = true;
  notification.deliveredAt = new Date();
  await notification.save();

  logger.info(`Notification ${id} marked as delivered`);

  res.json({
    success: true,
    message: 'Notification marked as delivered',
    data: {
      notification
    }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Caregiver only)
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check authorization
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === notification.patientId.toString()
    );
    
    if (!isLinked && notification.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }
  } else if (user.role !== 'caregiver') {
    return res.status(403).json({
      success: false,
      message: 'Only caregivers can delete notifications'
    });
  }

  // Soft delete
  notification.isActive = false;
  await notification.save();

  logger.info(`Notification ${id} deleted`);

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get upcoming notifications for today
// @route   GET /api/notifications/today
// @access  Private
const getTodayNotifications = asyncHandler(async (req, res) => {
  const user = req.user;
  let patientId = user.role === 'patient' ? user._id : req.query.patientId;

  // If user is caregiver and has linked patients, get notifications for all
  if (user.role === 'caregiver' && user.linkedPatients.length > 0) {
    const patientIds = user.linkedPatients.map(p => p.toString());
    // For now, just get the first patient's notifications
    patientId = patientIds[0];
  }

  // If patientId is not provided for caregiver, return error
  if (user.role === 'caregiver' && !patientId) {
    return res.status(400).json({ success: false, message: 'Patient ID is required for caregivers.' });
  }

  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59));

  const notifications = await Notification.find({
    patientId,
    isActive: true,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ 'notificationTime.hour': 1, 'notificationTime.minute': 1 });

  res.json({
    success: true,
    data: {
      notifications
    }
  });
});

module.exports = {
  createMedicationNotification,
  createTaskNotification,
  getNotificationsByPatient,
  markNotificationAsDelivered,
  deleteNotification,
  getTodayNotifications
};

