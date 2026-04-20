const User = require('../models/User');
const bcrypt = require('bcryptjs');

//  ADD USER
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, phoneno, address, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (!/^[a-zA-Z ]+$/.test(name.trim()))
      return res.status(400).json({ message: 'Name must contain letters only' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: 'User with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
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

//  GET ALL — excludes soft-deleted, supports ?search=
exports.getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
let filter = { isDeleted: { $ne: true } };

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: { $regex: regex } }, { email: { $regex: regex } }];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

//  SOFT DELETE — sets isDeleted flag, never removes from DB
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isDeleted) return res.status(400).json({ message: 'User already deleted' });

    await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {    console.error('Update user error:', error);    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

//  UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isDeleted) return res.status(400).json({ message: 'Cannot update a deleted user' });

    if (updates.name && !/^[a-zA-Z ]+$/.test(updates.name.trim()))
      return res.status(400).json({ message: 'Name must contain letters only' });
    if (updates.name && updates.name.trim().length > 15)
      return res.status(400).json({ message: 'Name must be 15 characters or less' });

    if (updates.email) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
        return res.status(400).json({ message: 'Invalid email address' });
      updates.email = normalizedEmail;

      const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (existingUser)
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    if (updates.phoneno && !/^[0-9]{10}$/.test(updates.phoneno))
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });

    if (updates.address && updates.address.length > 50)
      return res.status(400).json({ message: 'Address must be 50 characters or less' });

    if (updates.password && updates.password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (req.file) {
      updates.profilePic = `/uploads/profile_pics/${req.file.filename}`;
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: 'Updated Successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};