const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Caregiver only)
const createTask = asyncHandler(async (req, res) => {
  const { patientId, title, description, dueDate, priority, category, recurring, notes, notificationTime } = req.body;
  const createdBy = req.user._id;

  const task = await Task.create({
    patientId,
    title,
    description,
    dueDate,
    priority,
    category,
    recurring,
    notes,
    createdBy
  });

  logger.info(`New task created: ${title} for patient ${patientId}`);

  // Create notification for this task
  try {
    await createTaskNotification(task, notificationTime, createdBy);
  } catch (notificationError) {
    logger.error(`Failed to create notification for task ${task._id}:`, notificationError);
    // Don't fail the task creation if notifications fail
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      task: task.toObject()
    }
  });
});

// Helper function to create task notification
const createTaskNotification = async (task, notificationTime, createdBy) => {
  if (!task.dueDate) {
    return;
  }

  const taskDueDate = new Date(task.dueDate);
  const defaultTime = { hour: 9, minute: 0 };
  const time = notificationTime || defaultTime;

  const scheduledDate = new Date();
  scheduledDate.setUTCFullYear(taskDueDate.getUTCFullYear());
  scheduledDate.setUTCMonth(taskDueDate.getUTCMonth());
  scheduledDate.setUTCDate(taskDueDate.getUTCDate());
  scheduledDate.setUTCHours(time.hour);
  scheduledDate.setUTCMinutes(time.minute);
  scheduledDate.setUTCSeconds(0);
  scheduledDate.setUTCMilliseconds(0);

  const notification = await Notification.create({
    patientId: task.patientId,
    taskId: task._id,
    type: 'task',
    title: `Task Reminder: ${task.title}`,
    message: task.description || `Don't forget to complete: ${task.title}`,
    scheduledDate: scheduledDate,
    notificationTime: time,
    isActive: true,
    isDelivered: false,
    recurring: task.recurring || { type: 'none', days: [] },
    createdBy
  });

  logger.info(`Created notification for task ${task._id}`);
};

// @desc    Get all tasks for a patient
// @route   GET /api/tasks/patient/:patientId
// @access  Private (Patient or linked Caregiver)
const getTasksByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { 
    completed, 
    category, 
    priority, 
    isActive = true,
    page = 1, 
    limit = 20 
  } = req.query;
  const user = req.user;

  // Authorization: Ensure user is the patient or a linked caregiver
  if (user.role === 'patient' && user._id.toString() !== patientId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own tasks.',
    });
  }

  if (user.role === 'caregiver' && !user.linkedPatients.some(p => p._id.toString() === patientId || p.toString() === patientId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this patient.',
    });
  }

  const options = {
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
    category,
    priority,
    isActive: isActive === 'true',
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Task.getPatientTasks(patientId, options);

  res.json({
    success: true,
    data: {
      tasks: result,
    },
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private (Patient or linked Caregiver)
const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id)
    .populate('patientId', 'name username')
    .populate('createdBy', 'name role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: {
      task
    }
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Caregiver only)
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, priority, category, recurring, notes, isActive } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user is the creator or a linked caregiver
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === task.patientId.toString()
    );
    
    if (!isLinked && task.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks for your linked patients.'
      });
    }
  } else if (user.role === 'patient') {
    if (task.patientId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own tasks.'
      });
    }
  }

  // Update fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (priority !== undefined) task.priority = priority;
  if (category !== undefined) task.category = category;
  if (recurring !== undefined) task.recurring = recurring;
  if (notes !== undefined) task.notes = notes;
  if (isActive !== undefined) task.isActive = isActive;

  await task.save();

  logger.info(`Task updated: ${task.title}`);

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: {
      task: task.toObject()
    }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Caregiver only)
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user is the creator or a linked caregiver
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === task.patientId.toString()
    );
    
    if (!isLinked && task.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete tasks for your linked patients.'
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: 'Only caregivers can delete tasks'
    });
  }

  // Soft delete by setting isActive to false
  task.isActive = false;
  await task.save();

  logger.info(`Task deleted: ${task.title}`);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// @desc    Mark task as completed
// @route   POST /api/tasks/:id/complete
// @access  Private (Patient or linked Caregiver)
const markTaskCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check access permissions
  const user = req.user;
  if (user.role === 'patient' && task.patientId.toString() !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only complete your own tasks.'
    });
  }

  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === task.patientId.toString()
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  await task.markCompleted(notes);

  logger.info(`Task completed: ${task.title}`);

  res.json({
    success: true,
    message: 'Task marked as completed',
    data: {
      task: task.toObject()
    }
  });
});

// @desc    Mark task as incomplete
// @route   POST /api/tasks/:id/incomplete
// @access  Private (Patient or linked Caregiver)
const markTaskIncomplete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check access permissions
  const user = req.user;
  if (user.role === 'patient' && task.patientId.toString() !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own tasks.'
    });
  }

  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === task.patientId.toString()
    );
    
    if (!isLinked) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not linked to this patient.'
      });
    }
  }

  await task.markIncomplete();

  logger.info(`Task marked incomplete: ${task.title}`);

  res.json({
    success: true,
    message: 'Task marked as incomplete',
    data: {
      task: task.toObject()
    }
  });
});

// @desc    Get task statistics for a patient
// @route   GET /api/tasks/patient/:patientId/stats
// @access  Private (Patient or linked Caregiver)
const getTaskStats = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const tasks = await Task.find({
    patientId,
    isActive: true,
    createdAt: { $gte: startDate }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const overdueTasks = tasks.filter(task => task.isOverdue()).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Category breakdown
  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  // Priority breakdown
  const priorityStats = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  // Weekly completion trend
  const weeklyStats = [];
  for (let i = 0; i < Math.ceil(parseInt(days) / 7); i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekTasks = tasks.filter(task => 
      task.createdAt >= weekStart && task.createdAt <= weekEnd
    );

    const weekCompleted = weekTasks.filter(task => task.completed).length;

    weeklyStats.push({
      week: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      total: weekTasks.length,
      completed: weekCompleted,
      completionRate: weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0
    });
  }

  res.json({
    success: true,
    data: {
      overview: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate
      },
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats,
      weeklyTrend: weeklyStats
    }
  });
});

module.exports = {
  createTask,
  getTasksByPatient,
  getTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  markTaskIncomplete,
  getTaskStats
};
