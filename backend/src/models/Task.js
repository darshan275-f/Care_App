const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['medication', 'appointment', 'exercise', 'social', 'personal', 'other'],
    default: 'other'
  },
  recurring: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  completionNotes: {
    type: String,
    maxlength: [500, 'Completion notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
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
taskSchema.index({ patientId: 1, isActive: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ completed: 1 });

// Method to mark task as completed
taskSchema.methods.markCompleted = function(notes = '') {
  this.completed = true;
  this.completedAt = new Date();
  if (notes) {
    this.completionNotes = notes;
  }
  return this.save();
};

// Method to mark task as incomplete
taskSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.completedAt = undefined;
  this.completionNotes = undefined;
  return this.save();
};

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return !this.completed && new Date() > this.dueDate;
};

// Method to get days until due
taskSchema.methods.getDaysUntilDue = function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Static method to get tasks for a patient
taskSchema.statics.getPatientTasks = function(patientId, options = {}) {
  const query = { patientId, isActive: true };
  
  if (options.completed !== undefined) {
    query.completed = options.completed;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  return this.find(query).sort({ dueDate: 1, priority: -1 });
};

module.exports = mongoose.model('Task', taskSchema);
