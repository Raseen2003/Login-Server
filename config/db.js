const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.CONNECTION_STRING);
console.log(`MongoDB connected: ${conn.connection.host}`); 
};

module.exports = connectDB;
