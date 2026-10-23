const mongoose = require('mongoose');
const User = require('./user');

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId:{
     type: mongoose.Schema.Types.ObjectId,
     ref:User,
     required:true,
  },
   toUserId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:User,
    required:true,
   },
   status:{
    type:String,
    required:true,
    enum:{
      values:["interested","ignored","accepted","rejected"],
      message:'{VALUE} is not accepted as status.'
    }
   }
},{
  timestamps:true
}
)

connectionRequestSchema.index({fromUserId:1,toUserId:1})

connectionRequestSchema.pre('save',function(){
  const connectionRequestObj = this;
  if(connectionRequestObj.fromUserId.equals(connectionRequestObj.toUserId)){
    throw new Error('Cannot send the request to yourself')
  }
})

const connectionRequest = new mongoose.model('connectionRequest',connectionRequestSchema);

module.exports={connectionRequest};