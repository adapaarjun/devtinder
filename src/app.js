const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const {validationSignUp} = require('./utils/validation');
const bcrypt = require('bcrypt')
const app = express();

app.use(express.json())

app.post('/signup',async(req,res)=>{
   try{
     validationSignUp(req);
     const {firstName,lastName,emailId,password} = req.body;
     const passwordHash = await bcrypt.hash(password,10);
     const user = new User({
      firstName,
      lastName,
      emailId,
      password:passwordHash
     })
     await user.save();
     res.send('User Data Added to DB Successfully!!!')
   }catch(err){
     console.log(err.message);
     res.status(400).send('Error:' + err.message)
   }
})

app.post('/login',async(req,res)=>{
  try{
    const {emailId,password} = req.body;
    const user = await User.findOne({emailId:emailId})
    console.log(user);
    if(!user){
      throw new Error('user email doesnot exist')
    }
    const isPasswordExist = await bcrypt.compare(password,user.password);
    console.log(isPasswordExist);
    if(isPasswordExist){
      res.send('Login Successful')
    }else{
      res.status(404).send('Entered password is wrong')
    }
  }catch(err){
    res.status(404).send('Error:' + err.message)
  }
})

app.get('/feed',async(req,res)=>{
   try{
    const user = await User.find({})
    res.send(user)
   }catch(err){
    res.status(404).send('User not found');
   }
})

app.get('/user',async(req,res)=>{
  const userEmail = req.body.emailId;
  try{
   const users = await User.find({emailId:userEmail});
   if(users.length!==0){
       res.send(users);
   }else{
     res.status(404).send('User is not found')
   }
  
  }catch(err){
    res.status(404).send('something went wrong')
  }
})

app.delete('/user',async(req,res)=>{
  try{
    const {userId} = req.body;
     await User.findByIdAndDelete(userId)
     res.send('User Deleted Successfully')
  }catch(err){
    res.status(404).send('Something went wrong while deleting')
  }
})

app.patch('/user/:userId',async(req,res)=>{
   const userId = req.params?.userId
   try{
    const allowedUpdates = ['photoUrl','about','gender','skills'];
    const isUpdateAllowed = Object.keys(req.body).every((k)=>allowedUpdates.includes(k));
    if(!isUpdateAllowed){
       throw new Error("Update not allowed")
    }
    if(req.body.skills?.length>10){
      throw new Error("Skills are not allowed to update if it is more than 10")
    }
    const user = await User.findByIdAndUpdate({_id:userId},req.body,{returnDocument:'before',runValidators:true});
    console.log(user);
      res.send('Updated the User Successfully')
   }catch(err){
      res.status(404).send('Something went wrong while updating the data' + " " + err.message)
   }
   
})

connectDB()
.then(()=>{
  console.log('Established connection to database');
  app.listen(3000,()=>{
  console.log('Server is up and listening at port 3000')
})
})
.catch((err)=>{
   console.log(err.message)
})

