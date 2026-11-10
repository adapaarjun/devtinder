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
    console.log("🔥 RAZORPAY WEBHOOK TRIGGERED!");
  try {
    console.log("Razorpay webhook received!");

    const webhookSignature = req.get("X-Razorpay-Signature");

    if (!req.rawBody || !webhookSignature) {
      return res.status(400).json({
        msg: "Missing webhook body or signature",
      });
    }

    // 1. Verify webhook signature
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

    // 2. Check event type
    const event = req.body.event;

    if (event !== "payment.captured") {
      return res.status(200).json({
        msg: `Event ${event} received, no action required`,
      });
    }

    // 3. Extract payment details
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      return res.status(404).json({
        msg: "Payment record not found",
      });
    }

    // 4. Update payment status
    payment.status = paymentDetails.status;
    await payment.save();

    // 5. Activate premium membership
    const user = await User.findById(payment.userId);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    user.isPremium = true;
    user.memberShipType = payment.notes.memberShipType;

    await user.save();

    console.log("Premium membership activated successfully!");

    return res.status(200).json({
      msg: "Webhook successfully processed",
    });

  } catch (err) {
    console.error("Webhook error:", err);

    return res.status(500).json({
      msg: err.message,
    });
  }
});


module.exports = paymentRouter;
