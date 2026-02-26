import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:3000';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get cart items with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (item.quantity > item.product.stockQuantity) {
        return res.status(400).json({ message: `Insufficient stock for product ID ${item.productId}` });
      }
      totalAmount += parseFloat(item.product.price) * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          shippingAddress,
          status: 'PENDING',
        },
      });

      // Create order items and update stock
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user.id },
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Order created',
      orderId: order.id,
      totalAmount
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders.map(order => ({
      id: order.id,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status.toLowerCase(),
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus.toLowerCase(),
      stripePaymentId: order.stripePaymentId,
      createdAt: order.createdAt
    })));
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(id),
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order.id,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status.toLowerCase(),
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus.toLowerCase(),
      stripePaymentId: order.stripePaymentId,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: getImageUrl(item.product.imageUrl),
        }
      }))
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

export default router;
