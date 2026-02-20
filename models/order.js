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
      },
      unit: {      // [MUST ADD] क्योंकि server.js इसे भेज रहा है
        type: String,
        default: 'kg'
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
  // [MUST ADD] लोकेशन के बिना डिलीवरी बॉय को घर ढूँढने में दिक्कत होगी
  lat: Number,
  lng: Number,
  
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
