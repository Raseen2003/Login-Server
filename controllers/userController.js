const AddUser = require('../models/Add-user');


exports.addRandomUser = async (req, res) => {
  try {
    const { username, email, phoneno, address } = req.body;
    
   
    const newUser = new AddUser({
      username,
      email,
      phoneno,
      address
   
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully to the list!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAllRandomUsers = async (req, res) => {
  try {
    const users = await AddUser.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.deleteRandomUser = async (req, res) => {
  try {
    const { id } = req.params;
    await AddUser.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
exports.updateRandomUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phoneno, address } = req.body; 

    const updatedUser = await AddUser.findByIdAndUpdate(
      id,
      { username, email, phoneno, address },
      { new: true }
    );  

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {   

    res.status(500).json({ message: 'Update failed', error: error.message });
  }  
};  
