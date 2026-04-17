const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');


router.post('/add', protect, isAdmin, userController.addUser);
router.get('/all', protect, userController.getAllUsers);
router.delete('/:id', protect, isAdmin, userController.deleteUser);
router.put('/:id', protect, isAdmin, upload.single('profilePic'), userController.updateUser);

module.exports = router;