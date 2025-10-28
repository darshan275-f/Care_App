const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required']
  },
  text: {
    type: String,
    required: [true, 'Journal text is required'],
    trim: true,
    maxlength: [2000, 'Journal entry cannot be more than 2000 characters']
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image URL must be a valid image URL'
    }
  },
  mood: {
    type: String,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
journalEntrySchema.index({ patientId: 1, createdAt: -1 });
journalEntrySchema.index({ authorId: 1 });
journalEntrySchema.index({ mood: 1 });

// Method to add tag
journalEntrySchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag) && this.tags.length < 10) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
journalEntrySchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to get entries for a patient
journalEntrySchema.statics.getPatientEntries = function(patientId, options = {}) {
  const query = { patientId, isActive: true };
  
  if (options.mood) {
    query.mood = options.mood;
  }
  
  if (options.authorId) {
    query.authorId = options.authorId;
  }
  
  if (options.isPrivate !== undefined) {
    query.isPrivate = options.isPrivate;
  }
  
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query)
    .populate('authorId', 'name role')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get mood statistics
journalEntrySchema.statics.getMoodStats = function(patientId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        patientId: new mongoose.Types.ObjectId(patientId),
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
