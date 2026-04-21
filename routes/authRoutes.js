const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../middleware/validate');

router.post('/register',registerValidation,asyncHandler(authController.register));
router.post('/login',loginValidation,asyncHandler(authController.login));
router.post('/forgot-password',forgotPasswordValidation, asyncHandler(authController.forgotPassword));
router.post('/reset-password/:token', resetPasswordValidation,asyncHandler(authController.resetPassword));

module.exports = router;
