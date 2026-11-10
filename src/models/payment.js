const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  receipt:{
    type:String,
    required:true
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  notes: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    memberShipType: {
      type: String,
    },
  },
},{
  timestamps:true
});

module.exports = mongoose.model("Payment", paymentSchema);
