import express from 'express';
import Stripe from 'stripe';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/create-intent', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(order.totalAmount) * 100),
      currency: 'inr',
      metadata: {
        orderId: order.id.toString(),
        userId: req.user.id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        stripePaymentId: paymentIntentId,
        status: 'PROCESSING',
      },
    });

    res.json({ message: 'Payment confirmed', status: 'paid' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = parseInt(paymentIntent.metadata.orderId);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'PROCESSING',
      },
    });
  }

  res.json({ received: true });
});

export default router;
