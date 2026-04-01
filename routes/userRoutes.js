const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {protect,isAdmin} = require('../middleware/auth');


router.post('/add', protect, isAdmin, userController.addRandomUser);
router.get('/all', userController.getAllRandomUsers);
router.delete('/:id', protect, isAdmin, userController.deleteRandomUser);
router.put('/:id', protect, isAdmin, userController.updateRandomUser);


module.exports = router;      
