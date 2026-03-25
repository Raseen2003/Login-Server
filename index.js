require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const User = require('./models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.CONNECTION_STRING)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(' Could not connect to MongoDB', err));


app.post('/api/register', async (req, res) => {
   try {
        let { name, email, password } = req.body;
        email = email ? email.toLowerCase() : email;

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("🔥 SERVER ERROR:", err);   
    }
});

app.post('/api/login', async (req, res) => {
    let { email, password } = req.body;
    email = email ? email.toLowerCase() : email;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1h' }
        );

        console.log('Login User Retrieved:', { name: user.name, email: user.email });
        res.json({
            token,
            message: "Login successful",
            user: {
                name: user.name,
               email: user.email 
            }
        });

    } catch (err) {
  console.error("🔥 DATABASE ERROR:", err); // 👈 This makes the error appear in VS Code!
  res.status(500).json({ error: "Server error" });
}
});

app.post('/api/forgot-password', async (req, res) => {
    let { email } = req.body; 
    email = email ? email.toLowerCase() : email;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No user found with that email" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Use the frontend port (4200) instead of the backend port for the reset link!
        const frontendHost = req.headers.host.replace(/:\d+$/, ':4200');

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process:\n\n
http://${frontendHost}/reset-password/${token}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));