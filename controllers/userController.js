const User = require('../models/User');
const bcrypt = require('bcryptjs');


exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneno, address, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 2. Hash the password so they can login later
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new user document
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword, 
      phoneno: phoneno || '',
      address: address || '',
      role: role || 'user'
    });

    await newUser.save();
    res.status(201).json({ message: 'New user created successfully by Admin!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add user', error: error.message });
  }
};

// Get all REAL registered users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding passwords, newest first
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// Update a user (Admin Edit)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // 🌟 If Admin provided a new password, hash it!
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      // If password is empty/missing, remove it so we don't overwrite with null
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Updated Successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};