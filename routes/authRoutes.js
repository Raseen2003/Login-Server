const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const userController = require('../controllers/userController'); // You'll need this for CRUD
const { protect, isAdmin } = require('../middleware/authMiddleware'); // The new file we discussed
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation,
  userValidation // Add a validation for the "Add User" form
} = require('../middleware/validate');

// --- PUBLIC ROUTES ---
// Note: Validation comes BEFORE the Controller
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// --- ADMIN ONLY ROUTES ---
// 1. protect: Checks if they are logged in
// 2. isAdmin: Checks if their role is 'admin' (The Enum check)
router.post('/add-user', protect, isAdmin, userValidation, userController.addUser);
router.get('/all-users', protect, userController.getUsers);
router.delete('/delete-user/:id', protect, isAdmin, userController.deleteUser);

module.exports = router;