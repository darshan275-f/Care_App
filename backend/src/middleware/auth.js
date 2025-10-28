const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens').populate('linkedPatients', 'name username email contactNumber').populate('linkedCaregivers', 'name email contactNumber');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check user role
const ensureRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    
    next();
  };
};

// Middleware to check if user can access patient data
const ensurePatientAccess = async (req, res, next) => {
  try {
    const { id: patientId } = req.params;
    const user = req.user;
    
    // Patients can only access their own data
    if (user.role === 'patient') {
      if (user._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
    }
    
    // Caregivers can only access linked patients' data
    if (user.role === 'caregiver') {
      const isLinked = user.linkedPatients.some(patient => 
        patient._id.toString() === patientId
      );
      
      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not linked to this patient.'
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Patient access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during access check.'
    });
  }
};

// Middleware to refresh access token
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }
    
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }
    
    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);
    
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: user.toJSON()
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.'
    });
  }
};

module.exports = {
  generateTokens,
  verifyToken,
  authenticate,
  ensureRole,
  ensurePatientAccess,
  refreshAccessToken
};