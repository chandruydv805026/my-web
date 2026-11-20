import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value: { type: Number, required: true },
  maxDiscount: { type: Number, default: 500 },
  minOrder: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
