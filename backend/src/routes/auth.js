const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  linkPatient
} = require('../controllers/authController');
const { refreshAccessToken } = require('../middleware/auth');
const { authenticate, ensureRole } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/link-patient', ensureRole('caregiver'), linkPatient);

module.exports = router;
