require("dotenv").config();
const express = require("express");
const Zarinpal = require("zarinpal-node-sdk");

const router = express.Router();

// Initialize client with sandbox = true
const zarinpal = new Zarinpal(process.env.ZARINPAL_MERCHANT_ID, {
  sandbox: true
});

// Create payment and redirect link
router.post("/create", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const response = await zarinpal.payments.create({
      amount, // amount in Tomans
      callback_url: process.env.CALLBACK_URL,
      description: `Order #${orderId} payment`
    });

    // Get authority and redirect URL
    const { authority, url } = response.data;

    console.log("Zarinpal payment authority:", authority);

    // Return redirect URL to frontend
    return res.json({ paymentUrl: url });
  
  } catch (error) {
    console.error("Zarinpal create error:", error);
    return res.status(500).json({ error: "Payment initiation failed" });
  }
});

// Zarinpal callback (called after user completes payment)
router.get("/callback", async (req, res) => {
  const { Authority, Status } = req.query;
  
  if (Status !== "OK") {
    return res.status(400).send("Payment was cancelled or unsuccessful");
  }

  try {
    const verifyResponse = await zarinpal.verifications.verify({
      amount: Number(req.query.amount), // same amount you sent
      authority: Authority
    });

    const { ref_id } = verifyResponse.data;

    // Payment verified successfully
    console.log("Zarinpal verification ref id:", ref_id);

    res.send(`Payment successful! Reference: ${ref_id}`);

  } catch (error) {
    console.error("Zarinpal verify error:", error);
    res.status(500).send("Payment verification failed");
  }
});

module.exports = router;
