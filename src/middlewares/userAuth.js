const jwt = require("jsonwebtoken");
const User = require("../models/user");


const userAuth = async (req,res,next)=>{
    try{
    const {token} = req.cookies;
    if(!token || token === "j:null"){
      throw new Error('Session Expired!Please Login')
    }
    const decodedData = await jwt.verify(token,"Dev@tinder1909");
    const {_id} = decodedData;
    const user = await User.findById(_id);
    if(!user){
      throw new Error('user does not exist')
    }
    req.user = user;
    next();
    }catch(err){
      res.status(401).send('Error message from userauth:' + err.message)
    }
}


module.exports = {
  userAuth
}