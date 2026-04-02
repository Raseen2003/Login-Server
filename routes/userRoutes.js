const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ➕ POST: Create a new user (Admin Task)
router.post('/add', userController.addUser);

// 📄 GET: Fetch all registered users
router.get('/all', userController.getAllUsers);

// 🗑️ DELETE: Remove a user
router.delete('/:id', userController.deleteUser);

// 📝 PUT: Update an existing user
router.put('/:id', userController.updateUser);

module.exports = router;