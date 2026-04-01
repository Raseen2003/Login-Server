// const mongoose = require('mongoose');

// const addUserSchema = new mongoose.Schema({
//   username: { 
//     type: String, 
//     required: true,
//     trim: true,
//     match: [/^[a-zA-Z ]*$/, 'Name should only contain letters']
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     lowercase: true,
//     trim: true 
//   },
//   phoneno: { type: String, required: true },
//   address: { type: String, required: true },
//   // addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
// }, { timestamps: true });

// module.exports = mongoose.model('AddUser', addUserSchema);