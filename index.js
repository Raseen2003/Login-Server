// index.js
require('dotenv').config();
const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { connect } = require('http2');
const connectDB = require('./config/db');

const app = express();
connectDB();
// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
//  correct for Express v5
app.all('*path', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
// Global error handler (must be last)
app.use(errorHandler);

// DB + server startup
// const startServer = async () => {
//   await mongoose.connect(process.env.CONNECTION_STRING);
//   console.log('Connected to MongoDB');
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// };

// startServer().catch(console.error);
// ... after all your app.use routes ...

const startServer = async () => {
  try {
    // This calls the function from your new db.js
    await connectDB(); 
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Server is actually running on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Server failed to start:', error);
  }
};

startServer();