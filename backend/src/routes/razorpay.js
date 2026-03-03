import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

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

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(order.totalAmount) * 100),
      currency: 'INR',
      receipt: `order_${order.id}`,
      notes: {
        orderId: order.id.toString(),
        userId: req.user.id.toString()
      }
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: razorpayPaymentId,
        status: 'PROCESSING',
      },
    });

    res.json({ message: 'Payment verified successfully', status: 'paid' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id' });
});

export default router;
