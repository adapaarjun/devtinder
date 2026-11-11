const express = require("express");
const { userAuth } = require("../middlewares/userAuth");
const razorpayInstance = require("../utils/razorPay");
const Payment = require("../models/payment");
const { memeberShipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, emailId } = req.user;
    const { memberShipType } = req.body;

    const order = await razorpayInstance.orders.create({
      amount: memeberShipAmount[memberShipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        memberShipType,
        emailId,
      },
    });

    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      currency: order.currency,
      amount: order.amount,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    console.log(savedPayment);

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.log(err);
    res.json({ err });
  }
});




paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      req.rawBody.toString("utf8"),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "Invalid webhook signature",
      });
    }
    const event = req.body.event;

    if (event !== "payment.captured") {
      return res.status(200).json({
        msg: "Event received, no action required",
      });
    }
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      console.log("Payment record not found!");

      return res.status(500).json({
        msg: "Payment record not found",
      });
    }

    // 7. Prevent duplicate processing
    if (payment.status === "captured") {
      console.log("Payment already processed!");

      return res.status(200).json({
        msg: "Payment already processed",
      });
    }

    // 8. Verify amount and currency
    if (
      paymentDetails.amount !== payment.amount ||
      paymentDetails.currency !== payment.currency
    ) {
      console.log("Payment amount or currency mismatch!");

      return res.status(400).json({
        msg: "Payment amount or currency mismatch",
      });
    }

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);

    if (!user) {
      return res.status(500).json({
        msg: "User not found",
      });
    }

    // 11. Activate premium membership
    user.isPremium = true;
    user.memberShipType = payment.notes.memberShipType;

    await user.save();

    return res.status(200).json({
      msg: "Webhook successfully processed",
    });

  } catch (err) {
    console.error("Webhook error:", err);

    return res.status(500).json({
      msg: "Webhook processing failed",
      error: err.message,
    });
  }
});


paymentRouter.get('/premium/verify',userAuth,async(req,res)=>{
  const user = req.user.toJSON();
  if(user.isPremium){
    return res.json({...user})
  }else {
    return res.json({...user})
  }
})



module.exports = paymentRouter;
