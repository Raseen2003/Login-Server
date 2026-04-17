const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: 
         { type: String, 
            required: true, 
            trim: true },
    email: 
    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: 
    { type: String, required: true },
    role: 
    { type: String, enum: ['user', 'admin'], default: 'user' },
    phoneno: 
    { type: String, trim: true, default: '' },
    address: 
    { type: String, trim: true, default: '' },
    profilePic: 
    { type: String, default: 'default-avatar.png' },
    //  Soft delete fields
    isDeleted: 
    {
         type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, 
{ timestamps: true });

module.exports = mongoose.model('User', userSchema);