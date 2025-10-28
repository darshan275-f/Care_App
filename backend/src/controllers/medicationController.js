const Medication = require('../models/Medication');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private (Caregiver only)
const createMedication = asyncHandler(async (req, res) => {
  const { patientId, name, dosage, schedule, notes } = req.body;
  const createdBy = req.user._id;

  const medication = await Medication.create({
    patientId,
    name,
    dosage,
    schedule,
    notes,
    createdBy
  });

  logger.info(`New medication created: ${name} for patient ${patientId}`);

  // Create notifications for this medication
  try {
    await createMedicationNotifications(medication, createdBy);
  } catch (notificationError) {
    logger.error(`Failed to create notifications for medication ${medication._id}:`, notificationError);
    // Don't fail the medication creation if notifications fail
  }

  res.status(201).json({
    success: true,
    message: 'Medication created successfully',
    data: {
      medication: medication.toObject()
    }
  });
});

// Helper function to create medication notifications
const createMedicationNotifications = async (medication, createdBy) => {
  if (!medication.schedule || !medication.schedule.times || medication.schedule.times.length === 0) {
    return;
  }

  const notifications = [];
  const now = new Date();

  // For daily medications, create notifications for the next 30 days
  if (medication.schedule.type === 'daily') {
    for (let i = 0; i < 30; i++) {
      for (const time of medication.schedule.times) {
        const scheduledDate = new Date();
        scheduledDate.setUTCFullYear(now.getUTCFullYear());
        scheduledDate.setUTCMonth(now.getUTCMonth());
        scheduledDate.setUTCDate(now.getUTCDate() + i);
        scheduledDate.setUTCHours(time.hour);
        scheduledDate.setUTCMinutes(time.minute);
        scheduledDate.setUTCSeconds(0);
        scheduledDate.setUTCMilliseconds(0);

        const notification = await Notification.create({
          patientId: medication.patientId,
          medicationId: medication._id,
          type: 'medication',
          title: `Medication Reminder: ${medication.name}`,
          message: `Time to take ${medication.name} (${medication.dosage})`,
          scheduledDate,
          notificationTime: { hour: time.hour, minute: time.minute },
          isActive: true,
          isDelivered: false,
          recurring: { type: 'daily', days: [] },
          createdBy
        });
        
        notifications.push(notification);
      }
    }
  }
  // For weekly medications
  else if (medication.schedule.type === 'weekly' && medication.schedule.days) {
    // Create notifications for the next 8 weeks
    for (let week = 0; week < 8; week++) {
      for (const day of medication.schedule.days) {
        for (const time of medication.schedule.times) {
          const targetDate = new Date();
          const currentDay = targetDate.getUTCDay();
          let daysUntilNext = (day - currentDay + 7) % 7;
          if (week > 0) {
            daysUntilNext += week * 7;
          }
          targetDate.setUTCDate(targetDate.getUTCDate() + daysUntilNext);

          const scheduledDate = new Date();
          scheduledDate.setUTCFullYear(targetDate.getUTCFullYear());
          scheduledDate.setUTCMonth(targetDate.getUTCMonth());
          scheduledDate.setUTCDate(targetDate.getUTCDate());
          scheduledDate.setUTCHours(time.hour);
          scheduledDate.setUTCMinutes(time.minute);
          scheduledDate.setUTCSeconds(0);
          scheduledDate.setUTCMilliseconds(0);

          const notification = await Notification.create({
            patientId: medication.patientId,
            medicationId: medication._id,
            type: 'medication',
            title: `Medication Reminder: ${medication.name}`,
            message: `Time to take ${medication.name} (${medication.dosage})`,
            scheduledDate,
            notificationTime: { hour: time.hour, minute: time.minute },
            isActive: true,
            isDelivered: false,
            recurring: { type: 'weekly', days: [day] },
            createdBy
          });
          
          notifications.push(notification);
        }
      }
    }
  }

  logger.info(`Created ${notifications.length} notifications for medication ${medication._id}`);
};

// @desc    Get all medications for a patient
// @route   GET /api/medications/patient/:patientId
// @access  Private (Patient or linked Caregiver)
const getMedicationsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { isActive = true } = req.query;
  const user = req.user;

  // Authorization: Ensure user is the patient or a linked caregiver
  if (user.role === 'patient' && user._id.toString() !== patientId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own medications.',
    });
  }

  if (user.role === 'caregiver' && !user.linkedPatients.some(p => p._id.toString() === patientId || p.toString() === patientId)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not linked to this patient.',
    });
  }

  const medications = await Medication.find({
    patientId,
    isActive: isActive === 'true',
  })
    .populate('createdBy', 'name role')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: {
      medications,
    },
  });
});

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private (Patient or linked Caregiver)
const getMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const medication = await Medication.findById(id)
    .populate('patientId', 'name username')
    .populate('createdBy', 'name role');

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  res.json({
    success: true,
    data: {
      medication
    }
  });
});

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private (Caregiver only)
const updateMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, dosage, schedule, notes, isActive } = req.body;

  const medication = await Medication.findById(id);

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  // Check if user is the creator or a linked caregiver
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === medication.patientId.toString()
    );
    
    if (!isLinked && medication.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update medications for your linked patients.'
      });
    }
  } else if (user.role === 'patient') {
    if (medication.patientId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own medications.'
      });
    }
  }

  // Update fields
  if (name !== undefined) medication.name = name;
  if (dosage !== undefined) medication.dosage = dosage;
  if (schedule !== undefined) medication.schedule = schedule;
  if (notes !== undefined) medication.notes = notes;
  if (isActive !== undefined) medication.isActive = isActive;

  await medication.save();

  logger.info(`Medication updated: ${medication.name}`);

  res.json({
    success: true,
    message: 'Medication updated successfully',
    data: {
      medication: medication.toObject()
    }
  });
});

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private (Caregiver only)
const deleteMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const medication = await Medication.findById(id);

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  // Check if user is the creator or a linked caregiver
  const user = req.user;
  if (user.role === 'caregiver') {
    const isLinked = user.linkedPatients.some(patientId => 
      patientId.toString() === medication.patientId.toString()
    );
    
    if (!isLinked && medication.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete medications for your linked patients.'
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: 'Only caregivers can delete medications'
    });
  }

  // Soft delete by setting isActive to false
  medication.isActive = false;
  await medication.save();

  logger.info(`Medication deleted: ${medication.name}`);

  res.json({
    success: true,
    message: 'Medication deleted successfully'
  });
});

// @desc    Get medication adherence statistics
// @route   GET /api/medications/:id/stats
// @access  Private (Patient or linked Caregiver)
const getMedicationStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  const medication = await Medication.findById(id);

  if (!medication) {
    return res.status(404).json({
      success: false,
      message: 'Medication not found'
    });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const recentEntries = medication.takenDates.filter(entry => 
    entry.date >= startDate
  );

  const totalDays = parseInt(days);
  const takenCount = recentEntries.filter(entry => entry.taken).length;
  const skippedCount = recentEntries.filter(entry => entry.skipped).length;
  const missedCount = totalDays - takenCount - skippedCount;

  const adherenceRate = totalDays > 0 ? Math.round((takenCount / totalDays) * 100) : 0;

  // Get weekly breakdown
  const weeklyStats = [];
  for (let i = 0; i < Math.ceil(totalDays / 7); i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekEntries = recentEntries.filter(entry => 
      entry.date >= weekStart && entry.date <= weekEnd
    );

    const weekTaken = weekEntries.filter(entry => entry.taken).length;
    const weekSkipped = weekEntries.filter(entry => entry.skipped).length;
    const weekMissed = 7 - weekTaken - weekSkipped;

    weeklyStats.push({
      week: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      taken: weekTaken,
      skipped: weekSkipped,
      missed: weekMissed,
      adherenceRate: Math.round((weekTaken / 7) * 100)
    });
  }

  res.json({
    success: true,
    data: {
      medication: {
        _id: medication._id,
        name: medication.name,
        dosage: medication.dosage
      },
      stats: {
        totalDays,
        taken: takenCount,
        skipped: skippedCount,
        missed: missedCount,
        adherenceRate
      },
      weeklyBreakdown: weeklyStats
    }
  });
});

module.exports = {
  createMedication,
  getMedicationsByPatient,
  getMedication,
  updateMedication,
  deleteMedication,
  getMedicationStats
};
