const User = require('../models/user.model');
const bcrypt = require('bcrypt');


exports.getSingleUser = async (req,res)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user,message:"User fetched successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllUsers =  async (req,res)=>{
    try {
        const users =  await User.find();
        res.status(200).json({users,message:"All users fetched successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.deleteUser = async (req,res)=>{
    try {
        const {id} = req.user;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({message:"User deleted successfully"})
    } catch (error) {
        res.status(200).json({message:error.message});
    }
}


exports.updateUser = async (req,res)=>{
    try {
        const {id} = req.user;
        const { firstName, lastName, email,  role } = req.body;
        const photo = req.file.location;
        const user = await User.findByIdAndUpdate(id,{ firstName, lastName, email, role,photo },{new:true});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user,message:"User updated successfully"});
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



