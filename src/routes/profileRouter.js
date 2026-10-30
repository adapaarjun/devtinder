const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateProfileData } = require('../utils/validation');

const profileRouter = express.Router();

profileRouter.get('/profile/view',userAuth,async(req,res)=>{
  try{
    const user = req.user;
    res.send(user);
  }catch(err){
    res.status(404).send("Please Login")
  }
})

profileRouter.patch('/profile/edit',async(req,res)=>{
  try{
    const {token} = req.cookies;
    if(!token || token === "j:null"){
      throw new Error('Session Expired')
    }
    const jwtToken = await jwt.verify(token,"Dev@tinder1909");
    const {_id} = jwtToken
    const user = await User.findById(_id);
    if(!user){
      throw new Error('User does not exist');
    }
    const isAllowedEdit = validateProfileData(req);
    if(!isAllowedEdit){
      throw new Error('Editing is not permitted');
    }
    Object.keys(req.body).forEach(keys => user[keys]=req.body[keys]);
    res.json({
      message:`${user.firstName},your data is edited successfully`,
      data:user
    })
    user.save();
  }catch(err){
    res.status(400).send('Error:' + err.message);
  }
})

module.exports = {
  profileRouter
}