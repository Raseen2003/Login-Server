const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {upload} = require('../middleware/upload');

// ➕ POST: Create a new user (Admin Task)
router.post('/add', userController.addUser);

// 📄 GET: Fetch all registered users
router.get('/all', userController.getAllUsers);

// 🗑️ DELETE: Remove a user
router.delete('/:id', userController.deleteUser);

// 📝 PUT: Update an existing user
// router.put('/:id', userController.updateUser);
router.put('/:id', upload.single('profilePic'), userController.updateUser);
module.exports = router;