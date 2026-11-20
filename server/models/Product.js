import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: 'RatuMart' },
  category: { type: String, required: true },
  audience: { type: String, enum: ['kids', 'men', 'women'], required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.6 },
  ratingCount: { type: Number, default: 1 },
  assured: { type: Boolean, default: true },
  tag: { type: String, default: 'Trending' },
  image: { type: String, required: true },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  fabric: { type: String, default: '100% Pure Cotton' },
  fit: { type: String, default: 'Regular Fit' },
  washCare: { type: String, default: 'Machine Wash' },
  stockLeft: { type: Number, default: 25 },
  deliveryDays: { type: String, default: 'Tomorrow, 4:00 PM' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Virtual for id
productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
