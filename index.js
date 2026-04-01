  require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const authRoutes = require('./routes/authRoutes');
  const userRoutes = require('./routes/userRoutes'); 

  const app = express();


  app.use(express.json());
  app.use(cors());


  mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' Could not connect to MongoDB', err));


  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  function printRoutes(stack, prefix = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
    
        console.log(` [${Object.keys(middleware.route.methods).join(',').toUpperCase()}] ${prefix}${middleware.route.path}`);
      } else if (middleware.name === 'router') {
       
        printRoutes(middleware.handle.stack, prefix + middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^\\', ''));
      }
    });
  }
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(` Server is officially LIVE at http://localhost:${PORT}`);

  });