const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // 🌟 NEW FIELDS FOR ADMIN EDIT
    phoneno: {
        type: String,
        trim: true,
        default: '' 
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    
    // We store the URL or file path as a string
    profilePic: {
        type: String, 
        default: 'default-avatar.png' // Optional: a default image
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);