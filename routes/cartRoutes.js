const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// 🔧 Utility: calculate total and subtotals
function calculateTotal(cart) {
  cart.totalPrice = 0;
  cart.items.forEach(item => {
    item.subtotal = item.quantity * item.price;
    cart.totalPrice += item.subtotal;
  });
}

// ✅ Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, name, quantity, price } = req.body;
    if (!userId || !productId || !name || quantity == null || price == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        name,
        quantity: Number(quantity),
        price: Number(price),
        subtotal: Number(quantity) * Number(price)
      });
    }

    calculateTotal(cart);
    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error("POST /cart/add error:", err);
    res.status(500).json({ error: 'Cart जोड़ने में समस्या हुई' });
  }
});

// ✅ Update item quantity
router.put('/update', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || quantity == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(i => i.productId === productId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.quantity = Number(quantity);
    calculateTotal(cart);
    await cart.save();
    res.status(200).json({ message: 'Quantity updated', cart });
  } catch (err) {
    console.error("PUT /cart/update error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const index = cart.items.findIndex(i => i.productId === productId);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    cart.items.splice(index, 1);
    calculateTotal(cart);
    await cart.save();
    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    console.error("DELETE /cart/remove error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Clear entire cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    res.json({ message: 'Cart cleared', cart });
  } catch (err) {
    console.error("DELETE /cart/clear error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;