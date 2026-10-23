const express = require('express');
const {validationSignUp} = require('../utils/validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authRouter = express.Router();


authRouter.post('/signup',async(req,res)=>{
  try{
    const {firstName,lastName,emailId,password} = req.body;
    const passwordHash = await bcrypt.hash(password,10)
    validationSignUp(req)
    const user = new User({
      firstName,
      lastName,
      emailId,
      password:passwordHash
    })
   await user.save();
   res.send('User Successfully Signup')
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
    res.send('Login Successfull')
  }catch(err){
    res.status(404).send("Error:" + err.message)
  }
})

authRouter.post('/logout',async(req,res)=>{
   res.cookie('token',null,{
    expires:new Date(Date.now())
   });
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