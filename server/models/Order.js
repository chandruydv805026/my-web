import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number,
    distanceKm: Number
  },
  items: [
    {
      id: String,
      name: String,
      brand: String,
      price: Number,
      originalPrice: Number,
      selectedSize: String,
      selectedColor: String,
      quantity: Number,
      image: String
    }
  ],
  totalAmount: { type: Number, required: true },
  savings: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'UPI' },
  status: { type: String, default: 'Confirmed' },
  deliveryDate: { type: String, default: 'Expected in 2 Days' },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret.orderId || ret._id.toString();
    ret.date = new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    ret.address = ret.shippingAddress;
    return ret;
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
