const authService = require('../services/authService');

exports.register = async (req, res) => {
  await authService.register(req.body);
  res.status(201).json({ message: 'User registered successfully!' });
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
};

exports.forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json({ message: 'Reset link sent to your email!' });
};

exports.resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  res.status(200).json({ message: 'Password reset successful!' });
};