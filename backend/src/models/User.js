const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['patient', 'caregiver'],
    required: [true, 'Role is required']
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness when present
    trim: true
  },
  linkedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  linkedCaregivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  contactNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  }
}, {
  timestamps: true
});

// Generate unique username for patients
userSchema.statics.generatePatientUsername = async function() {
  let username;
  let isUnique = false;
  
  while (!isUnique) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    username = `pat_${randomNum}`;
    const existingUser = await this.findOne({ username });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return username;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Link patient and caregiver
userSchema.methods.linkPatient = function(patientId) {
  if (!this.linkedPatients.includes(patientId)) {
    this.linkedPatients.push(patientId);
  }
  return this.save();
};

userSchema.methods.linkCaregiver = function(caregiverId) {
  if (!this.linkedCaregivers.includes(caregiverId)) {
    this.linkedCaregivers.push(caregiverId);
  }
  return this.save();
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.refreshTokens;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
