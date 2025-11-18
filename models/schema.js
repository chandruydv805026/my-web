const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },

  // 🛒 Cart reference
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    default: null
  },
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  lastSubscribedAt: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
