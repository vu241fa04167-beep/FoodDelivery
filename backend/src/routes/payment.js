const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { orderId },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntentId,
      });
      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;