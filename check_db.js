import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './server/models/Order.js';
import User from './server/models/User.js';

dotenv.config({ path: 'server/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orders = await Order.find({});
  console.log('Orders in DB:', orders.length);
  orders.forEach(o => {
    console.log(`- Order: ${o.orderId} | ${o.customerName} | ₹${o.totalAmount} | ${o.status}`);
  });

  const users = await User.find({});
  console.log('Users in DB:', users.length);
  users.forEach(u => {
    console.log(`- User: ${u.name} | ${u.email} | ${u.phone} | role: ${u.role}`);
  });
  process.exit(0);
}
check();
