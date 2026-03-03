import express from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const GOKWIK_API_KEY = process.env.GOKWIK_API_KEY || 'your_gokwik_api_key';
const GOKWIK_SECRET_KEY = process.env.GOKWIK_SECRET_KEY || 'your_gokwik_secret_key';
const GOKWIK_MERCHANT_ID = process.env.GOKWIK_MERCHANT_ID || 'your_merchant_id';
const GOKWIK_BASE_URL = process.env.GOKWIK_BASE_URL || 'https://api.gokwik.co';

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

    const payload = {
      merchant_id: GOKWIK_MERCHANT_ID,
      amount: Math.round(parseFloat(order.totalAmount) * 100),
      currency: 'INR',
      order_id: `order_${order.id}`,
      customer: {
        name: req.user.firstName || req.user.email,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    };

    const response = await fetch(`${GOKWIK_BASE_URL}/v1/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GOKWIK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gokwik API error:', data);
      return res.status(500).json({ message: 'Failed to create payment order' });
    }

    res.json({
      gokwikOrderId: data.order_id || data.id,
      amount: data.amount,
      currency: 'INR',
      checkoutUrl: data.checkout_url || `${GOKWIK_BASE_URL}/checkout/${data.order_id}`
    });
  } catch (error) {
    console.error('Create Gokwik order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const signatureData = `${orderId}${paymentId}${GOKWIK_SECRET_KEY}`;
    const expectedSignature = crypto.createHash('sha256').update(signatureData).digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: paymentId,
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
  res.json({ 
    merchantId: GOKWIK_MERCHANT_ID,
    apiKey: GOKWIK_API_KEY 
  });
});

router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { order_id, status, transaction_id } = req.body;

    if (status === 'success' || status === 'captured') {
      const orderId = parseInt(order_id.replace('order_', ''));
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          razorpayPaymentId: transaction_id,
          status: 'PROCESSING',
        },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
