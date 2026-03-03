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

router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price),
        imageUrl: getImageUrl(item.product.imageUrl),
        stockQuantity: item.product.stockQuantity,
        category: item.product.category
      }
    }));

    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Cart response - itemCount:', itemCount, 'items:', items.map(i => ({id: i.id, qty: i.quantity})));

    res.json({
      items,
      total: Math.round(total * 100) / 100,
      itemCount
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        return res.status(400).json({ message: 'Insufficient stock for requested quantity' });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
      });
    }

    res.status(201).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity > cartItem.product.stockQuantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
    });

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

export default router;
