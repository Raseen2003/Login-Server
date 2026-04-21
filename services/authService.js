
const User = require('../models/User');
const UserToken = require('../models/UserToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('./emailService');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError('User already exists', 400);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await User.create({ name, email: normalizedEmail, password: hashedPassword });
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.isDeleted) throw new AppError('Invalid email or password', 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 400);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user: { name: user.name, email: user.email, role: user.role } };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('No user found with this email', 404);

  const resetToken = crypto.randomBytes(32).toString('hex');
  await UserToken.create({ userId: user._id, token: resetToken });
  await emailService.sendPasswordReset(user.email, resetToken);
};

const resetPassword = async (token, newPassword) => {
  const tokenDoc = await UserToken.findOne({ token });
  if (!tokenDoc) throw new AppError('Token invalid or expired', 400);

  const isExpired = Date.now() - tokenDoc.createdAt.getTime() > TOKEN_EXPIRY_MS;
  if (isExpired) {
    await UserToken.deleteOne({ _id: tokenDoc._id });
    throw new AppError('Token has expired. Please request a new one', 400);
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) throw new AppError('User not found', 404);

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await Promise.all([user.save(), UserToken.deleteOne({ _id: tokenDoc._id })]);
};

module.exports = { register, login, forgotPassword, resetPassword };