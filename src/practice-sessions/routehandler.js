const express = require('express');

const app = express();

/* 
app.use('/user',(req,res,next)=>{
  console.log('Handling user1 route-handler');
 // res.send('Response 1');
  next();
},(req,res)=>{
  console.log('Handling user2 route-handler')
  res.send('Response 2')
}); */


//handling multiple route handlers

app.use('/user',(req,res,next)=>{
  console.log('Hanlding user1 routhandler');
  next();
},[(req,res,next)=>{
  console.log('Hanlding user2 routhandler');
  next();
},(req,res,next)=>{
  console.log('Hanlding user3 routhandler');
  next();
}],(req,res,next)=>{
  console.log('Hanlding user4 routhandler');
  next();
},(req,res,next)=>{
  console.log('Hanlding user4 routhandler');
  res.send('Respone 5');
})

app.listen(3001,()=>{
  console.log('Server is up and running successfully')
})