require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(express.json());
app.use(cors());


mongoose.connect(process.env.CONNECTION_STRING)
.then(() => console.log(' Connected to MongoDB'))
.catch(err => console.error(' Could not connect to MongoDB', err));


app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));