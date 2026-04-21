const userService = require('../services/userService');

// ── ADD USER ──────────────────────────────────────────────
exports.addUser = async (req, res) => {
  await userService.addUser(req.body);
  res.status(201).json({ success: true, message: 'New user created successfully!' });
};

// ── GET ALL USERS ─────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers(req.query.search);
res.status(200).json(users);
};

// ── DELETE USER ───────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
res.status(200).json({ message: 'User removed successfully' });
};

// ── UPDATE USER ───────────────────────────────────────────
exports.updateUser = async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, { ...req.body }, req.file);
  res.status(200).json({ success: true, message: 'Updated successfully', user: updatedUser });
};
