const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, patientUsername } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  let user;
  let linkedPatient = null;

  if (role === 'patient') {
    // Create patient user
    const username = await User.generatePatientUsername();
    user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      username
    });

    logger.info(`New patient registered: ${email} with username: ${username}`);
  } else if (role === 'caregiver') {
    // Create caregiver user
    if (!patientUsername) {
      return res.status(400).json({
        success: false,
        message: 'Patient username is required for caregiver registration'
      });
    }

    // Find the patient by username
    linkedPatient = await User.findOne({ 
      username: patientUsername, 
      role: 'patient' 
    });

    if (!linkedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found with the provided username'
      });
    }

    user = await User.create({
      name,
      email,
      passwordHash: password,
      role
    });

    // Link caregiver to patient
    await user.linkPatient(linkedPatient._id);
    await linkedPatient.linkCaregiver(user._id);

    logger.info(`New caregiver registered: ${email} linked to patient: ${patientUsername}`);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  // Save refresh token
  await user.addRefreshToken(refreshToken);

  // Populate linked data for response
  await user.populate([
    { path: 'linkedPatients', select: 'name username email contactNumber' },
    { path: 'linkedCaregivers', select: 'name email contactNumber' }
  ]);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      accessToken,
      refreshToken,
      user: user.toJSON()
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  // Save refresh token
  await user.addRefreshToken(refreshToken);

  // Populate linked data for response
  await user.populate([
    { path: 'linkedPatients', select: 'name username email contactNumber' },
    { path: 'linkedCaregivers', select: 'name email contactNumber' }
  ]);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      refreshToken,
      user: user.toJSON()
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = req.user;

  if (refreshToken) {
    await user.removeRefreshToken(refreshToken);
  } else {
    // Remove all refresh tokens
    user.refreshTokens = [];
    await user.save();
  }

  logger.info(`User logged out: ${user.email}`);

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  // Populate linked data
  await user.populate([
    { path: 'linkedPatients', select: 'name username email contactNumber' },
    { path: 'linkedCaregivers', select: 'name email contactNumber' }
  ]);

  res.json({
    success: true,
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, contactNumber } = req.body;
  const user = req.user;

  if (name) {
    user.name = name;
  }
  
  if (contactNumber !== undefined) {
    user.contactNumber = contactNumber;
  }

  await user.save();

  // Populate linked data
  await user.populate([
    { path: 'linkedPatients', select: 'name username email contactNumber' },
    { path: 'linkedCaregivers', select: 'name email contactNumber' }
  ]);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Link caregiver to patient
// @route   POST /api/auth/link-patient
// @access  Private (Caregiver only)
const linkPatient = asyncHandler(async (req, res) => {
  const { patientUsername } = req.body;
  const caregiver = req.user;

  if (caregiver.role !== 'caregiver') {
    return res.status(403).json({
      success: false,
      message: 'Only caregivers can link to patients'
    });
  }

  // Find the patient by username
  const patient = await User.findOne({ 
    username: patientUsername, 
    role: 'patient' 
  });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found with the provided username'
    });
  }

  // Check if already linked
  const isAlreadyLinked = caregiver.linkedPatients.some(patientId => 
    patientId.toString() === patient._id.toString()
  );

  if (isAlreadyLinked) {
    return res.status(400).json({
      success: false,
      message: 'Patient is already linked to this caregiver'
    });
  }

  // Link caregiver to patient
  await caregiver.linkPatient(patient._id);
  await patient.linkCaregiver(caregiver._id);

  // Populate updated data
  await caregiver.populate([
    { path: 'linkedPatients', select: 'name username email contactNumber' },
    { path: 'linkedCaregivers', select: 'name email contactNumber' }
  ]);

  logger.info(`Caregiver ${caregiver.email} linked to patient ${patientUsername}`);

  res.json({
    success: true,
    message: 'Patient linked successfully',
    data: {
      user: caregiver.toJSON()
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  linkPatient
};
