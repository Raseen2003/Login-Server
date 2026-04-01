const { body, validationResult } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .custom((value) => !/\s/.test(value)).withMessage('No spaces allowed in password'),

  // The "Checker" function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }
    next(); 
  }
];
// login

exports.loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),

  // The "Checker" function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }
    next(); // Move to the Controller if data is clean
  }
];

// forgot password


exports.forgotPasswordValidation = [
  body('email').isEmail().withMessage('A valid email is required to reset password'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

// reset password

exports.resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .custom((value) => !/\s/.test(value)).withMessage('No spaces allowed'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];  