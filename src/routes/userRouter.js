const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const { connectionRequest } = require('../models/connectionRequest');
const { connections } = require('mongoose');
const User = require('../models/user');

const userRouter = express.Router();

userRouter.get('/requests',userAuth,async(req,res)=>{
  try{
    const loggedInUser = req.user;
    if(!loggedInUser){
      throw new Error('Please login to check the requests');
    }
    const userRequestObj = await connectionRequest.find({
      status:'interested',
      toUserId:loggedInUser._id
    }).populate('fromUserId','firstName lastName age about skills gender photoUrl')

    if(!userRequestObj){
      throw new Error("You don't have any connection requests")
    }

   const listOfRequestsNames = userRequestObj.map((names)=>{
    return `${names.fromUserId.firstName} ${names.fromUserId.lastName}`
   })

    res.json({
      message:`Hey ${loggedInUser.firstName} received requests from ${listOfRequestsNames}`,
      data:userRequestObj
    })
  }catch(err){
    res.status(400).send('Error:' + err.message)
  }
})


userRouter.get('/connections',userAuth,async(req,res)=>{
  try{
    const loggedInUser = req.user;
    const USER_REQUIREMENTS = 'firstName lastName gender about skills photoUrl age'
    const connectionsRecieved = await connectionRequest.find({
      $or:[
        {status:'accepted',toUserId:loggedInUser._id},
        {status:'accepted',fromUserId:loggedInUser._id}
      ]
    }).populate('fromUserId',USER_REQUIREMENTS).populate('toUserId',USER_REQUIREMENTS)
   

    const data = connectionsRecieved.map((item)=>{
      if(item.fromUserId._id.toString() === loggedInUser._id.toString()){
           return item.toUserId
      }else{
        return item.fromUserId
      }
    })
   
    res.json({
      data
    })

  }catch(err){
    res.json({message:err.message})
  }
})

userRouter.get('/feed',userAuth,async(req,res)=>{
  try{
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 10 ? 10 : limit

    const skip = (page-1)*limit;

    const connectionsToShow = await connectionRequest.find({
      $or:[
        {
          fromUserId:loggedInUser._id,
        },
        {
          toUserId:loggedInUser._id,
        }
      ]
    }).populate('fromUserId','firstName lastName').populate('toUserId','firstName lastName')

    console.log(connectionsToShow);

    //filtering the connections 

    const validConnections = connectionsToShow.filter((item)=>item.fromUserId && item.toUserId)

    const data = validConnections.map((item) => {
      if(item.fromUserId._id.toString() === loggedInUser._id.toString()){
          return item.toUserId
      }else{
        return item.fromUserId
      }
    })

    const idsToExclude = data.map((item)=>item._id)

    const userToShow = await User.find({
      _id:{
          $nin:idsToExclude,
          $ne:loggedInUser._id
        }
    }).select('firstName lastName age gender skills about photoUrl').skip(skip).limit(limit);

    res.json({
      message:"Connections in your feed",
      data:userToShow
    })

  }catch(err){
    res.status(400).send('Error:' + err.message)
  }
}) 


/* userRouter.get('/feed',userAuth,async(req,res)=>{
  try{
    const loggedInUser = req.user;

    const connectionsToShow = await connectionRequest.find({
      $or:[
        {
          fromUserId:loggedInUser._id,
        },
        {
          toUserId:loggedInUser._id,
        }
      ]
    })

    const hideUsersFromFeed = new Set();

    connectionsToShow.forEach((connection)=>{
       hideUsersFromFeed.add(connection.fromUserId);
       hideUsersFromFeed.add(connection.toUserId)
    })


    const userToShow = await User.find({
      $and:[
        { _id: {$nin:Array.from(hideUsersFromFeed)}},
        {_id:{$ne:loggedInUser._id}}
      ]
    }).select('firstName lastName age gender about skills')

    res.json({
      message:"Connections in your feed",
      data:userToShow
    })

  }catch(err){
    res.status(400).send('Error:' + err.message)
  }
}) */

module.exports = {userRouter}