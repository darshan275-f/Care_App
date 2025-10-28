const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    default: null
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  type: {
    type: String,
    enum: ['medication', 'task', 'reminder', 'appointment'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  notificationTime: {
    hour: {
      type: Number,
      required: true,
      min: 0,
      max: 23
    },
    minute: {
      type: Number,
      required: true,
      min: 0,
      max: 59
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  recurring: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none'
    },
    days: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 1 = Monday, etc.
    }]
  },
  notificationExpoTokens: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ patientId: 1, isActive: 1 });
notificationSchema.index({ scheduledDate: 1 });
notificationSchema.index({ 'notificationTime': 1 });
notificationSchema.index({ medicationId: 1 });
notificationSchema.index({ taskId: 1 });

// Method to check if notification should be triggered
notificationSchema.methods.shouldTrigger = function() {
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);

  // Get the server's local time in UTC
  const nowUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()));

  // Check if notification time has passed today and hasn't been delivered yet
  return nowUtc >= scheduled && !this.isDelivered && this.isActive;
};

module.exports = mongoose.model('Notification', notificationSchema);

