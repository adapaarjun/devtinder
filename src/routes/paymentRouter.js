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
    // 1. Check whether req.user exists
    console.log("Does req.user exist?", !!req.user);
    console.log("req.user:", req.user || "req.user is undefined");

    // 2. Get Razorpay webhook signature
    const webhookSignature = req.get("X-Razorpay-Signature");

    console.log("Does webhook signature exist?", !!webhookSignature);
    console.log("Does raw body exist?", !!req.rawBody);

    if (!req.rawBody || !webhookSignature) {
      return res.status(400).json({
        msg: "Missing webhook body or signature",
      });
    }

    // 3. Verify webhook signature
    const isWebhookValid = validateWebhookSignature(
      req.rawBody.toString("utf8"),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    console.log("Is webhook signature valid?", isWebhookValid);

    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "Invalid webhook signature",
      });
    }

    console.log("✅ Webhook signature verified!");

    // 4. Check event type
    const event = req.body.event;
    console.log("Webhook event:", event);

    if (event !== "payment.captured") {
      return res.status(200).json({
        msg: "Event received, no action required",
      });
    }

    // 5. Get payment details
    const paymentDetails = req.body.payload.payment.entity;

    console.log("Razorpay Payment Details:", {
      orderId: paymentDetails.order_id,
      paymentId: paymentDetails.id,
      status: paymentDetails.status,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
    });

    // 6. Find payment record
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

    // 9. Update payment status
    payment.status = paymentDetails.status;
    await payment.save();

    console.log("Payment status updated:", payment.status);

    // 10. Find user using payment.userId
    const user = await User.findById(payment.userId);

    console.log("Does user exist in database?", !!user);

    if (!user) {
      return res.status(500).json({
        msg: "User not found",
      });
    }

    // 11. Activate premium membership
    user.isPremium = true;
    user.memberShipType = payment.notes.memberShipType;

    await user.save();

    console.log("🎉 Premium membership activated successfully!");

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




module.exports = paymentRouter;
