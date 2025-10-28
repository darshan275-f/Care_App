const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['patient', 'caregiver'])
    .withMessage('Role must be either patient or caregiver'),
  body('patientUsername')
    .optional()
    .trim()
    .matches(/^pat_\d{4}$/)
    .withMessage('Patient username must be in format pat_XXXX'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Medication validation
const validateMedication = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Medication name must be between 1 and 100 characters'),
  body('dosage')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be between 1 and 50 characters'),
  body('schedule.type')
    .optional()
    .isIn(['daily', 'weekly', 'as-needed'])
    .withMessage('Schedule type must be daily, weekly, or as-needed'),
  body('schedule.times')
    .optional()
    .isArray()
    .withMessage('Schedule times must be an array'),
  body('schedule.times.*.hour')
    .optional()
    .isInt({ min: 0, max: 23 })
    .withMessage('Hour must be between 0 and 23'),
  body('schedule.times.*.minute')
    .optional()
    .isInt({ min: 0, max: 59 })
    .withMessage('Minute must be between 0 and 59'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

// Task validation
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Task title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('category')
    .optional()
    .isIn(['medication', 'appointment', 'exercise', 'social', 'personal', 'other'])
    .withMessage('Invalid category'),
  body('recurring.type')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly'])
    .withMessage('Recurring type must be none, daily, weekly, or monthly'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

// Journal entry validation
const validateJournalEntry = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Journal text must be between 1 and 2000 characters'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('mood')
    .optional()
    .isIn(['very-happy', 'happy', 'neutral', 'sad', 'very-sad'])
    .withMessage('Invalid mood value'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Each tag must be 20 characters or less'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
  handleValidationErrors
];

// Game stats validation
const validateGameStats = [
  body('gameType')
    .isIn(['memory-match', 'sequence-recall', 'word-association', 'number-sequence', 'color-match'])
    .withMessage('Invalid game type'),
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('maxScore')
    .isInt({ min: 1 })
    .withMessage('Max score must be a positive integer'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('level')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100'),
  body('attempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attempts must be a positive integer'),
  body('hintsUsed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Hints used must be a non-negative integer'),
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Patient ID validation
const validatePatientId = [
  param('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID format'),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateMedication,
  validateTask,
  validateJournalEntry,
  validateGameStats,
  validateObjectId,
  validatePatientId,
  validatePagination,
  handleValidationErrors
};
