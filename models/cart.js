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
    min: 1,
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

// ✅ Main Cart Schema
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);