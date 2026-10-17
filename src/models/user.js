const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
  {
    firstName:{
      type:String,
      required:true,
      minLength:4,
      maxlength:20
    },
    lastName:{
      type:String
    },
    emailId:{
      type:String,
      required:true,
      unique:true,
      trim:true,
      lowercase:true,
      validate(value){
       const isEmailValid = validator.isEmail(value);
       if(!isEmailValid){
         throw new Error('Email Id is not valid')
       }
      }
    },
    password:{
      type:String,
      validate(value){
        const isPasswordStrong = validator.isStrongPassword(value);
        if(!isPasswordStrong){
          throw new Error("Password is not strong enough")
        }
      }
    },
    age:{
      type:Number,
      min:18
    },
    gender:{
      type:String,
      validate(value){
        if(!['male','female','other'].includes(value)){
          throw new Error("Gender value is not valid")
        }
      }
    },
    photoUrl:{
      type:String,
      defaultValue:'../src/images.jpeg'
    },
    skills:{
      type:[String]
    },
    about:{
      type:String
    }
  },{
    timestamps:true
  }
)


const User = mongoose.model('User',UserSchema);

module.exports = User;