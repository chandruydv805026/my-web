const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ✅ Individual Cart Item Schema
const cartItemSchema = new Schema({
  productId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01, // ✅ अब 250g (0.25) और 500g (0.5) जैसी वैल्यू भी valid होंगी
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  }
}, { _id: false });

// ✅ Main Cart Schema with TTL
const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [cartItemSchema],
    default: []
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'ordered', 'cancelled'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 दिन बाद
    index: { expires: 0 } // TTL index
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
