const express = require('express');
const {validationSignUp} = require('../utils/validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authRouter = express.Router();


authRouter.post('/signup',async(req,res)=>{
  try{
    const {firstName,lastName,emailId,password,photoUrl} = req.body;
    const passwordHash = await bcrypt.hash(password,10)
    validationSignUp(req)
    const user = new User({
      firstName,
      lastName,
      emailId,
      photoUrl,
      password:passwordHash
    })
  const savedUser = await user.save();
  const token = await savedUser.getJWT();
  res.cookie('token',token)
  res.json({
    message:'User Created Successfully',
    data:savedUser
  })
  }catch(err){
    res.status(404).send('Error:' + err.message)
  }
})

authRouter.post('/login',async(req,res)=>{
  try{
    const {emailId,password} = req.body;
    const user = await User.findOne({emailId:emailId});
    if(!user){
      throw new Error('User does not exist,Please signup')
    }
    const isPassword = await user.validatePassword(password);
    if(!isPassword){
      throw new Error('wrong password')
    }
    const token = await user.getJWT();
    res.cookie('token',token)
    res.send(user)
  }catch(err){
    res.status(404).send("Error:" + err.message)
  }
})

authRouter.post('/logout',async(req,res)=>{
   res.clearCookie('token');
   res.send("logged out");
})

authRouter.patch('/forgot/password',async(req,res)=>{
  try{
    const {emailId,password} = req.body;
    const user = await User.findOne({emailId:emailId});
    if(!user){
      throw new Error('User does not exist,Please signup');
    }
    const passwordHash = await bcrypt.hash(password,10);
    user['password'] = passwordHash;
    user.save();
    res.send('Password Changed Successfully');
  }catch(err){
    res.status(400).send('Something went wrong')
  }
})

module.exports = {
  authRouter
}