const bcrypt = require('bcryptjs');

const User = require('../models/User');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

// ── ADD USER (admin) ──────────────────────────────────────
const addUser = async ({ name, email, password, phoneno, address, role }) => {
  if (!name || !email || !password)
    throw new AppError('Name, email and password are required', 400);

  if (!/^[a-zA-Z ]+$/.test(name.trim()))
    throw new AppError('Name must contain letters only', 400);

  if (password.length < 6)
    throw new AppError('Password must be at least 6 characters', 400);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('User with this email already exists', 400);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    phoneno: phoneno || '',
    address: address || '',
    role: role || 'user',
  });
};

// ── GET ALL USERS ─────────────────────────────────────────
const getAllUsers = async (search) => {
  const filter = { isDeleted: { $ne: true } };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  return User.find(filter).select('-password').sort({ createdAt: -1 });
};

// ── SOFT DELETE ───────────────────────────────────────────
const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.isDeleted) throw new AppError('User is already deleted', 400);

  await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
};

// ── UPDATE USER ───────────────────────────────────────────
const updateUser = async (id, updates, file) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.isDeleted) throw new AppError('Cannot update a deleted user', 400);

  if (updates.name) {
    if (!/^[a-zA-Z ]+$/.test(updates.name.trim()))
      throw new AppError('Name must contain letters only', 400);
    if (updates.name.trim().length > 15)
      throw new AppError('Name must be 15 characters or less', 400);
  }

  if (updates.phoneno && !/^[0-9]{10}$/.test(updates.phoneno))
    throw new AppError('Phone number must be exactly 10 digits', 400);

  if (updates.address && updates.address.length > 50)
    throw new AppError('Address must be 50 characters or less', 400);

  if (updates.password) {
    if (updates.password.length < 6)
      throw new AppError('Password must be at least 6 characters', 400);
    updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
  } else {
    delete updates.password;
  }

  if (file) {
    updates.profilePic = `/uploads/profile_pics/${file.filename}`;
  }

  return User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
};

module.exports = { addUser, getAllUsers, deleteUser, updateUser };
