const validator = require('validator');

const validationSignUp = (req)=>{
    const {firstName,lastName,emailId,password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Name is not valid")
    }else if(!validator.isEmail(emailId)){
      throw new Error("Enter correct email address")
    }else if(!validator.isStrongPassword(password)){
      throw new Error("Enter strong password")
    }
}

module.exports = {
  validationSignUp
}