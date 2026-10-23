const validator = require('validator');

const validationSignUp = (req,res,next)=>{
    const {firstName,lastName,emailId,password} = req.body;

    if(!firstName || !lastName){
        throw new Error("Name is not valid")
    }else if(!validator.isEmail(emailId)){
      throw new Error("Enter correct email address")
    }else if(!validator.isStrongPassword(password)){
      throw new Error("Enter strong password")
    }
}

const validateProfileData = (req)=>{
  const allowedEdits = ['firstName','lastName','about','skills','age','gender'];
  console.log(req.body);
  const isAllowed = Object.keys(req.body).every(key=>allowedEdits.includes(key));
  return isAllowed;
}

module.exports = {
  validationSignUp,
  validateProfileData
}