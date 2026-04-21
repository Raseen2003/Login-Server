// middleware/errorHandler.js
const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred' });
};