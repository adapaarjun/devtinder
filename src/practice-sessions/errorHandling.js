const express = require('express');
const app = express();

app.get('/getUserData',(req,res)=>{
  try{
    throw new Error('dvzhgke');
    res.send('user Data')
  }catch(err){
    res.status(500).send('Something went wrong please contact support team')
  }
})

app.use('/',(err,req,res,next)=>{
    if(err){
         res.status(500).send('Something went wrong');
    }else{
      res.send('Successfully data')
    }
})


app.listen('3004',()=>{
  console.log('Server is up and listening at 3004');
})