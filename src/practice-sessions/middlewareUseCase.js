const express = require('express');
const {adminAuth,userAuth} = require('./adminauth');


const app = express();

/* app.use('/admin',(req,res,next)=>{
  const token = 'xyz';
  const isAdminAuthorised = token === 'xyz'
  if(!isAdminAuthorised){
    res.status(401).send('unauthorised user')
  }else {
    next();
  }
}); */

app.use('/admin',adminAuth);

app.get('/user',userAuth,(req,res)=>{
  res.send('User Data Fetched')
})

app.get('/user/login',(req,res)=>{
  res.send('login Data Fetched')
})

app.get('/user/login/1',(req,res)=>{
  res.send('login Data Fetched Id 1')
})

app.get('/admin/getUserData',(req,res)=>{
  res.send('Send User Data');
})

app.get('/admin/deleteUserData',(req,res)=>{
  res.send('Deleted User');
})

app.listen('3003',()=>{
  console.log('Server is up and running at 3001');
});