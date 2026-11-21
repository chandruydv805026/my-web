import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  street: { type: String, default: '' },
  city: { type: String, default: 'Ranchi' },
  state: { type: String, default: 'Jharkhand' },
  pincode: { type: String, default: '835222' },
  landmark: { type: String, default: '' },
  type: { type: String, default: 'Home' }, // 'Home', 'Work', 'Other'
  lat: { type: Number, default: 23.414532 },
  lng: { type: Number, default: 85.216414 },
  distanceKm: { type: Number, default: 0 }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  phone: { type: String, required: true },
  role: { type: String, default: 'customer' }, // 'customer' or 'admin'
  address: addressSchema,
  addresses: {
    type: [addressSchema],
    validate: [val => val.length <= 2, 'A user can only have a maximum of 2 saved addresses.']
  },
  activeAddressIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
