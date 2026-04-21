const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const { protect, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/add', protect, isAdmin,asyncHandler(userController.addUser));
router.get('/all',protect,asyncHandler(userController.getAllUsers));
router.delete('/:id', protect, isAdmin,asyncHandler(userController.deleteUser));
router.put('/:id',protect, isAdmin, upload.single('profilePic'), asyncHandler(userController.updateUser));

module.exports = router;