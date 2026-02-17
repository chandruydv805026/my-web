const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash on Delivery', 'UPI', 'Card'],
    default: 'Cash on Delivery'
  }
});

module.exports = mongoose.model('Order', orderSchema);
