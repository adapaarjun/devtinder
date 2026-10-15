const express = require('express');

const app = express();

app.use("/test",(req,res)=>{
  res.send('Hello testing team, response from the server')
})

app.use("/user",(req,res)=>{
  res.send('Hello User, response from the server')
})

app.use("/",(req,res)=>{
  res.send('Hello you are in home page, response from the server')
})

app.listen(3000,()=>{
  console.log('Server is up and running successfully')
})