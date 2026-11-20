import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'customer' }, // 'customer' or 'admin'
  superCoins: { type: Number, default: 150 },
  address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
export default User;
