const adminAuth = (req,res,next)=>{
  const token = 'xyz';
  const isAdminAuthorised = token === 'xyz';
  if(!isAdminAuthorised){
    res.status(401).send('authorised admin')
  }else {
    next();
  }
}


const userAuth = (req,res,next)=>{
  const token = 'xyz';
  const isUserAuthorised = token === 'xyzeer';

  if(!isUserAuthorised){
    res.status(401).send('user unauthorised')
  }else{
    next();
  }
}

module.exports = {adminAuth,userAuth}