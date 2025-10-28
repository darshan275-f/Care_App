const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [100, 'Medication name cannot be more than 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [50, 'Dosage cannot be more than 50 characters']
  },
  schedule: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'as-needed'],
      default: 'daily'
    },
    times: [{
      hour: {
        type: Number,
        min: 0,
        max: 23,
        required: true
      },
      minute: {
        type: Number,
        min: 0,
        max: 59,
        default: 0
      }
    }],
    days: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 1 = Monday, etc.
    }]
  },
  takenDates: [{
    date: {
      type: Date,
      required: true
    },
    taken: {
      type: Boolean,
      default: false
    },
    takenAt: Date,
    skipped: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
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
medicationSchema.index({ patientId: 1, isActive: 1 });
medicationSchema.index({ 'takenDates.date': 1 });

// Method to mark medication as taken
medicationSchema.methods.markTaken = function(date, notes = '') {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  
  const existingEntry = this.takenDates.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (existingEntry) {
    existingEntry.taken = true;
    existingEntry.takenAt = new Date();
    existingEntry.skipped = false;
    existingEntry.notes = notes;
  } else {
    this.takenDates.push({
      date: today,
      taken: true,
      takenAt: new Date(),
      notes
    });
  }
  
  return this.save();
};

// Method to mark medication as skipped
medicationSchema.methods.markSkipped = function(date, notes = '') {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  
  const existingEntry = this.takenDates.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (existingEntry) {
    existingEntry.skipped = true;
    existingEntry.taken = false;
    existingEntry.notes = notes;
  } else {
    this.takenDates.push({
      date: today,
      skipped: true,
      notes
    });
  }
  
  return this.save();
};

// Method to get today's status
medicationSchema.methods.getTodayStatus = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.takenDates.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (!todayEntry) {
    return { status: 'pending', taken: false, skipped: false };
  }
  
  return {
    status: todayEntry.taken ? 'taken' : todayEntry.skipped ? 'skipped' : 'pending',
    taken: todayEntry.taken,
    skipped: todayEntry.skipped,
    takenAt: todayEntry.takenAt,
    notes: todayEntry.notes
  };
};

module.exports = mongoose.model('Medication', medicationSchema);
