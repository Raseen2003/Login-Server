const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const UserToken = require('../models/UserToken');   

// --- REGISTER ---
exports.register = async (req, res) => {
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
        console.error(" REGISTER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    let { email, password } = req.body;
    email = email ? email.toLowerCase() : email;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1h' }
        );

        res.status(200).json({
  token: token,
  user: {
    name: user.name,
    email: user.email,
    role: user.role 
  }
});
    } catch (err) {
        console.error(" LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }   
};

// --- FORGOT PASSWORD ---

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }


        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:4200';
        const baseUrl = frontendBase.endsWith('/') ? frontendBase : `${frontendBase}/`;

        // 2. Generate secure token
        const resetToken = crypto.randomBytes(32).toString("hex");

        await new UserToken({
            userId: user._id,
            token: resetToken
        }).save();

        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `${baseUrl}reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`
        };

       
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Reset link sent to your email!" });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};
// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        

        
        const tokenDoc = await UserToken.findOne({ token: token });
       

        if (!tokenDoc) {
            return res.status(400).json({ message: "Token invalid or expired." });
        }
        const oneHour = 60 * 60 * 1000;
if (Date.now() - tokenDoc.createdAt.getTime() > oneHour) {
  await UserToken.deleteOne({ _id: tokenDoc._id });
  return res.status(400).json({ message: "Token has expired. Please request a new one." });
}


        const user = await User.findById(tokenDoc.userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

       
        await UserToken.deleteOne({ _id: tokenDoc._id });

        res.json({ message: "Password reset successful!" });

    } catch (err) {
        console.error(" RESET ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
};  

