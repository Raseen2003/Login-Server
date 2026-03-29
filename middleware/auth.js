const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Check if user is logged in
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database (excluding password) and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Check if user is an Admin (The Guard)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Access granted
  } else {
    res.status(403).json({ message: 'Access Denied: Admins Only' });
  }
};

module.exports = { protect, isAdmin };