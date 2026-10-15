const express = require('express');

const app = express();


app.get('/user',(req,res)=>{
  res.send({firstName:'NB',lastName:'Adapa'})
});

app.post('/user',(req,res)=>{
  res.send('Successfully posted the data to database')
})

app.delete('/user',(req,res)=>{
  res.send('Successfully deleted the data from database')
})

app.use("/test",(req,res)=>{
  res.send('Hello testing team, response from the server')
})

app.listen(3000,()=>{
  console.log('Server is up and running successfully')
})