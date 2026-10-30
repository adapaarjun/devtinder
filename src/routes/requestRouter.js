const express = require('express');
const {userAuth} = require('../middlewares/userAuth')
const User = require('../models/user');
const { connectionRequest } = require('../models/connectionRequest');
const  jwt = require('jsonwebtoken');

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:toUserId',async(req,res)=>{
  try{
    const {token} = req.cookies;
    const decodedData = await jwt.verify(token,"Dev@tinder1909");
    const {_id} = decodedData;
    const user = await User.findById(_id);
    if(!user){
      throw new Error('User not found');
    }
    const fromUserId = user._id;
    const toUserId = req.params.toUserId;
    const allowedStatus = ['interested','ignored'];
    const status = req.params.status;
    const isAllowedStatus = allowedStatus.includes(status);
  
    if(!isAllowedStatus){
      throw new Error(`${status} not allowed`)
    }

    const existingConnectionRequest = await connectionRequest.findOne({
      $or:[
        {fromUserId,toUserId},
        {fromUserId:toUserId,toUserId:fromUserId}
      ]
    })

    if(existingConnectionRequest){
      throw new Error('Connection already Existed')
    }

    const requestModel = new connectionRequest({
      fromUserId,
      toUserId,
      status,
    })
   const requestSentToUser = await User.findById(toUserId);
   const data = await requestModel.save();

    res.json({
      message:`Hey ${user.firstName} your connection request is sent to ${requestSentToUser.firstName}`,
      data
    })
  }catch(err){
    res.status(400).send('Err:' + err.message)
  }
})

requestRouter.post('/request/review/:status/:requestId',userAuth,async(req,res)=>{
  try{
    const loggedInuser = req.user;
    const {status,requestId} = req.params;
    const allowedStatus = ['accepted','rejected'];
    console.log(`Request ID ${requestId} , status ${status}`)
    const isAllowedStatus = allowedStatus.includes(status);
    if(!isAllowedStatus){
      throw new Error(`${status} is not allowed`);
    }
    const connectionRequestObj = await connectionRequest.findOne({
      status:'interested',
      toUserId:loggedInuser._id,
      _id:requestId
    }) 

    console.log(connectionRequestObj)

    const ConnectionRequestDetails = await connectionRequest.findById(requestId);

    if(ConnectionRequestDetails === null){
     return res.status(400).send('Database is empty')
    }

  if(!connectionRequestObj){
    throw new Error('No connection request found')
  }

  const {fromUserId,toUserId} = ConnectionRequestDetails;
  const fromUser = await User.findById(fromUserId);
  const toUser = await User.findById(toUserId);


  connectionRequestObj.status = status;

  const data = await connectionRequestObj.save();

  res.json({
    message:`Hey ${toUser.firstName} ${toUser.lastName} ${status} the request from ${fromUser.firstName} ${fromUser.lastName}`,
    data
  })

  }catch(err){
    res.status(400).send('Error:' + err.message)
  }
})

module.exports = {requestRouter};