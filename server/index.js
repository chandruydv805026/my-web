import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import dns from 'node:dns';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';

// Fix for Windows DNS resolving SRV records for MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Product from './models/Product.js';
import Order from './models/Order.js';
import User from './models/User.js';
import Coupon from './models/Coupon.js';
import { v2 as cloudinary } from 'cloudinary';
import { 
  sendOrderNotification, 
  sendOrderStatusUpdate, 
  sendWelcomeNotification, 
  getNotificationLogs 
} from './services/notificationService.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ratumart_super_secret_jwt_key_2026';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ WARNING: MONGODB_URI environment variable is not defined!');
}

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log(`☁️ Cloudinary CDN configured with Cloud: "${process.env.CLOUDINARY_CLOUD_NAME}"`);
} else {
  console.log('📁 Cloudinary credentials not detected yet. Using fast local storage (/uploads/) with auto-switch.');
}

// Middleware
app.use(cors());
app.use(express.json());

// Uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `cloth_${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ================= CONNECT TO MONGODB ================= //

async function connectDB() {
  try {
    console.log('Connecting to MongoDB Atlas Database...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ CONNECTED TO MONGODB ATLAS: ${mongoose.connection.name}`);
    await seedInitialData();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

// Seed initial inventory for Kids, Men, Women & default Admin if empty
async function seedInitialData() {
  try {
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log('Seeding initial clothes inventory in MongoDB (Chhote Bachhe, Bade Log, Ladki)...');
      await Product.insertMany([
        // 1. Chhote Bachhe (Kids)
        {
          name: "Boys 3-Piece Festive Royal Blazer, Waistcoat & Trouser Suit Set",
          brand: "Little Gentleman",
          category: "kids",
          audience: "kids",
          price: 1199,
          originalPrice: 3299,
          discount: 63,
          rating: 4.8,
          ratingCount: 890,
          assured: true,
          tag: "Bachho Ka Party Bestseller",
          image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
          images: [
            "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=700&auto=format&fit=crop&q=80"
          ],
          sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
          colors: ["Midnight Blue", "Classic Black", "Wine Royal"],
          fabric: "Premium Poly-Viscose Suiting Fabric with Satin Lapel",
          fit: "Tailored Smart Fit for Boys",
          washCare: "Dry Clean Only",
          stockLeft: 15,
          deliveryDays: "Tomorrow, 2:00 PM",
          description: "Chhote bachho ke birthday, wedding aur family functions ke liye royal 3-piece suit set."
        },
        {
          name: "Girls Princess Sparkle Sequin Tiered Birthday Party Frock Gown",
          brand: "Tiny Diva Couture",
          category: "kids",
          audience: "kids",
          price: 849,
          originalPrice: 2499,
          discount: 66,
          rating: 4.7,
          ratingCount: 960,
          assured: true,
          tag: "Bacchi Ka Birthday Gown",
          image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80",
          images: [
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80"
          ],
          sizes: ["1-2 Yrs", "2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs"],
          colors: ["Lavender Shimmer", "Baby Pink", "Sky Blue"],
          fabric: "Soft Fluffy Tulle Net with 100% Cotton Scratch-Free Inner Lining",
          fit: "Flared Princess Gown",
          washCare: "Gentle Hand Wash Cold",
          stockLeft: 22,
          deliveryDays: "Tomorrow, 4:00 PM",
          description: "Chhoti bacchi ke liye pure soft cotton lining wala princess frock."
        },
        {
          name: "Boys Traditional Silk Kurta & Dhoti Pant Festive Set",
          brand: "Ratu Little Royals",
          category: "kids",
          audience: "kids",
          price: 699,
          originalPrice: 1899,
          discount: 63,
          rating: 4.6,
          ratingCount: 540,
          assured: true,
          tag: "Festive Kids Pick",
          image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80"],
          sizes: ["1-2 Yrs", "3-4 Yrs", "5-6 Yrs", "7-8 Yrs"],
          colors: ["Haldi Yellow", "Peacock Green", "Ruby Red"],
          fabric: "Pure Art Silk with Soft Cotton Lining",
          fit: "Comfortable Festive Dhoti Fit",
          washCare: "Gentle Machine Wash",
          stockLeft: 18,
          deliveryDays: "Delivery in 2 Days",
          description: "Puja, Diwali aur shaadi me chhote bachho ke liye aaramdayak kurta dhoti set."
        },

        // 2. Bade Log / Men
        {
          name: "Men Slim Fit Washed Pure Denim Biker Jacket",
          brand: "RoadRider Urban",
          category: "men",
          audience: "men",
          price: 1299,
          originalPrice: 3499,
          discount: 62,
          rating: 4.5,
          ratingCount: 2190,
          assured: true,
          tag: "Bestseller Men's Denim",
          image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
          images: [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80"
          ],
          sizes: ["S", "M", "L", "XL", "XXL"],
          colors: ["Vintage Blue", "Charcoal Black", "Washed Grey"],
          fabric: "100% Heavyweight Cotton Denim (12.5 oz)",
          fit: "Regular Slim Fit",
          washCare: "Machine Wash Cold inside out",
          stockLeft: 14,
          deliveryDays: "Tomorrow, 6:00 PM",
          description: "Bade ladko aur mardo ke liye rugged denim biker jacket."
        },
        {
          name: "Men's Luxury Jacquard Silk Kurta with Churidar Pyjama Set",
          brand: "Manyavar Elegance",
          category: "men",
          audience: "men",
          price: 1699,
          originalPrice: 4499,
          discount: 62,
          rating: 4.6,
          ratingCount: 1845,
          assured: true,
          tag: "Shaadi & Festive Special",
          image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80"],
          sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"],
          colors: ["Cream Gold", "Wine Red", "Navy Sapphire"],
          fabric: "Rich Silk Blend Jacquard Weave",
          fit: "Straight Classic Fit with Mandarin Collar",
          washCare: "Dry Clean Only",
          stockLeft: 12,
          deliveryDays: "Tomorrow, 1:00 PM",
          description: "Traditional Indian look ke liye Jacquard kurta pyjama set."
        },
        {
          name: "Men Regular Fit Pure Linen Breathable Casual Shirt",
          brand: "Allen Solly Casuals",
          category: "men",
          audience: "men",
          price: 799,
          originalPrice: 2299,
          discount: 65,
          rating: 4.4,
          ratingCount: 3410,
          assured: true,
          tag: "Daily Wear Shirt",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80"],
          sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"],
          colors: ["Crisp White", "Pastel Sky Blue", "Olive Sage", "Dusty Pink"],
          fabric: "100% Breathable Organic Linen-Cotton Weave",
          fit: "Modern Regular Fit with Curved Hem",
          washCare: "Machine Wash Warm",
          stockLeft: 28,
          deliveryDays: "Tomorrow, 11:00 AM",
          description: "Daily office wear aur casual look ke liye breathable pure linen shirt."
        },

        // 3. Ladki / Women
        {
          name: "Royal Banarasi Silk Embroidered Zari Saree with Blouse Piece",
          brand: "Ratu Heritage",
          category: "women-ethnic",
          audience: "women",
          price: 1499,
          originalPrice: 4999,
          discount: 70,
          rating: 4.7,
          ratingCount: 3840,
          assured: true,
          tag: "Women's Ethnic #1",
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
          images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80"
          ],
          sizes: ["Free Size (5.5m + 0.8m Blouse)"],
          colors: ["Deep Maroon", "Royal Emerald", "Peacock Blue"],
          fabric: "Pure Banarasi Art Silk with Woven Jacquard Gold Border",
          fit: "Traditional Draped Fit",
          washCare: "Dry Clean Preferred",
          stockLeft: 9,
          deliveryDays: "Tomorrow, 3:00 PM",
          description: "Shadi, festival aur puja ke liye heavy Zari Banarasi saree."
        },
        {
          name: "Embroidered Anarkali Kurta, Pant & Dupatta 3-Piece Festive Set",
          brand: "Biba Couture",
          category: "women-ethnic",
          audience: "women",
          price: 1899,
          originalPrice: 5999,
          discount: 68,
          rating: 4.8,
          ratingCount: 4210,
          assured: true,
          tag: "Top Rated Kurti Set",
          image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80"],
          sizes: ["XS", "S", "M", "L", "XL", "XXL"],
          colors: ["Rani Pink", "Mustard Yellow", "Powder Blue"],
          fabric: "Chanderi Cotton Silk with Organza Gota Patti Dupatta",
          fit: "Flared Anarkali Silhouette",
          washCare: "Gentle Hand Wash",
          stockLeft: 7,
          deliveryDays: "Tomorrow, 12:00 PM",
          description: "Ladkiyo aur aurato ke liye mirror work Anarkali 3-piece suit."
        },
        {
          name: "Women Heavily Embroidered Velvet Bridal Lehenga Choli Set",
          brand: "Ratu Royal Bride",
          category: "festive",
          audience: "women",
          price: 3499,
          originalPrice: 12999,
          discount: 73,
          rating: 4.9,
          ratingCount: 1420,
          assured: true,
          tag: "Bridal Lehenga Steal",
          image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80"],
          sizes: ["Semi-Stitched (Up to 44 Bust)"],
          colors: ["Deep Crimson Red", "Emerald Royalty", "Plum Velvet"],
          fabric: "Micro Velvet with Dori, Zari, and Sequence Hand Embroidery",
          fit: "Semi-Stitched with 3.8 Meter Flared Can-Can Included",
          washCare: "Specialist Dry Clean Only",
          stockLeft: 4,
          deliveryDays: "Delivery in 3 Days",
          description: "Heavy wedding bridal lehenga set with intricate gold threadwork."
        },
        {
          name: "Women French Floral Print Chiffon A-Line Maxi Dress",
          brand: "Zara Chic Studio",
          category: "women-western",
          audience: "women",
          price: 999,
          originalPrice: 2899,
          discount: 65,
          rating: 4.5,
          ratingCount: 1540,
          assured: true,
          tag: "Western Wear Dress",
          image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80"],
          sizes: ["XS", "S", "M", "L", "XL"],
          colors: ["Blush Floral", "Sage Green Floral", "Sky Blue"],
          fabric: "Breathable Georgette Chiffon with Soft Viscose Inner Lining",
          fit: "Tiered A-Line with Elasticated Smocked Waist",
          washCare: "Machine Wash Delicate",
          stockLeft: 19,
          deliveryDays: "Tomorrow, 5:00 PM",
          description: "College, party aur vacation ke liye stylish western floral dress."
        }
      ]);
      console.log('✅ Initial clothes inventory seeded in MongoDB!');
    }

    // Seed default coupons in MongoDB
    const coupCount = await Coupon.countDocuments();
    if (coupCount === 0) {
      await Coupon.insertMany([
        { code: 'RATU50', type: 'percent', value: 50, maxDiscount: 500, minOrder: 999, description: 'Flat 50% Off up to ₹500 on all fashion items' },
        { code: 'FIRSTORDER', type: 'flat', value: 150, minOrder: 499, description: 'Flat ₹150 Off + FREE Express Delivery on first purchase' },
        { code: 'FESTIVE100', type: 'flat', value: 100, minOrder: 799, description: 'Instant ₹100 Flat discount on festive wear' }
      ]);
    }

    // Seed default Admin User if doesn't exist
    const adminUser = await User.findOne({ email: 'admin@ratumart.com' });
    if (!adminUser) {
      await User.create({
        name: 'Ratu Store Admin',
        email: 'admin@ratumart.com',
        password: 'adminpassword123',
        phone: '+91 9876543210',
        role: 'admin',
        superCoins: 500,
        address: {
          name: 'RatuMart Admin',
          phone: '+91 9876543210',
          street: 'Main Road, Ratu',
          city: 'Ranchi',
          state: 'Jharkhand',
          pincode: '835222'
        }
      });
      console.log('✅ Default Admin User created in MongoDB: admin@ratumart.com');
    }

  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

// Connect to MongoDB
connectDB();

// ================= EMAIL AUTHENTICATION ROUTES ================= //

// 1. Register with Email + Password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already registered! Please login.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      superCoins: 150,
      address: {
        name,
        phone: phone || '',
        street: 'Main Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    // Send Welcome Notification
    try {
      await sendWelcomeNotification(user);
    } catch (notifErr) {
      console.warn('Welcome notification log error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB!',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Login with Email + Password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= PRODUCT ENDPOINTS (MONGODB) ================= //

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const { audience, category, search, sort, maxPrice } = req.query;
    const filter = {};

    if (audience && audience !== 'all') {
      filter.audience = audience;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { price: 1 };
    else if (sort === 'price-high') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'discount') sortObj = { discount: -1 };

    const products = await Product.find(filter).sort(sortObj);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (Save to MongoDB)
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body;
    const price = Number(body.price);
    const originalPrice = Number(body.originalPrice || body.price);
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    // Detect audience if not specified
    let audience = body.audience || 'men';
    const cat = (body.category || '').toLowerCase();
    const nameLower = (body.name || '').toLowerCase();
    if (cat.includes('kid') || nameLower.includes('boy') || nameLower.includes('girl') || nameLower.includes('bachhe')) {
      audience = 'kids';
    } else if (cat.includes('women') || cat.includes('ethnic') || nameLower.includes('saree') || nameLower.includes('kurti') || nameLower.includes('lehenga') || nameLower.includes('ladki')) {
      audience = 'women';
    }

    const sizes = Array.isArray(body.sizes) ? body.sizes : (body.sizes ? body.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL']);
    const colors = Array.isArray(body.colors) ? body.colors : (body.colors ? body.colors.split(',').map(c => c.trim()) : ['Standard']);
    const image = body.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=700&auto=format&fit=crop&q=80';

    const product = await Product.create({
      name: body.name,
      brand: body.brand || 'Ratu Originals',
      category: body.category || 'men',
      audience,
      price,
      originalPrice,
      discount,
      rating: 4.8,
      ratingCount: 1,
      assured: Boolean(body.assured),
      tag: body.tag || 'New Arrival',
      image,
      images: [image],
      sizes,
      colors,
      fabric: body.fabric || '100% Pure Cotton',
      fit: body.fit || 'Regular Fit',
      washCare: body.washCare || 'Machine Wash',
      stockLeft: Number(body.stockLeft) || 25,
      deliveryDays: body.deliveryDays || 'Tomorrow, 4:00 PM',
      description: body.description || ''
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', async (req, res) => {
  try {
    const body = req.body;
    if (body.price && body.originalPrice) {
      const p = Number(body.price);
      const op = Number(body.originalPrice);
      body.discount = op > p ? Math.round(((op - p) / op) * 100) : 0;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= REAL PHOTO UPLOAD (CLOUDINARY / LOCAL) ================= //

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo selected' });
    }

    // Check if Cloudinary is configured (either from startup or dynamically provided)
    const hasCloudConfig = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudConfig) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });

        console.log(`☁️ Uploading "${req.file.originalname}" to Cloudinary CDN...`);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ratumart/clothes',
          resource_type: 'image'
        });

        // Clean up temporary local file
        try { fs.unlinkSync(req.file.path); } catch (e) {}

        console.log(`✅ Uploaded to Cloudinary successfully: ${result.secure_url}`);
        return res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
          storage: 'cloudinary'
        });
      } catch (cloudErr) {
        console.error('⚠️ Cloudinary upload error, using local fallback:', cloudErr.message);
      }
    }

    // Fallback: Local Server Storage
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      storage: 'local'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= ORDER ENDPOINTS (MONGODB) ================= //

// GET /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders (Saves order & decrements stock in MongoDB)
app.post('/api/orders', async (req, res) => {
  try {
    const body = req.body;
    const orderId = `RATU-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const addr = body.address || {};
    const items = body.items || [];

    const order = await Order.create({
      orderId,
      customerName: addr.name || 'Customer',
      customerPhone: addr.phone || '+91 9999999999',
      customerEmail: addr.email || '',
      shippingAddress: addr,
      items,
      totalAmount: Number(body.totalAmount) || 0,
      savings: Number(body.savings) || 0,
      paymentMethod: body.paymentMethod || 'UPI',
      status: 'Confirmed',
      deliveryDate: 'Expected in 2 Days'
    });

    // Automatically decrement stock in MongoDB
    for (const it of items) {
      if (it.id && mongoose.Types.ObjectId.isValid(it.id)) {
        await Product.findByIdAndUpdate(it.id, {
          $inc: { stockLeft: -Math.max(1, Number(it.quantity) || 1) }
        });
      }
    }

    // Send Real-time Order Notification (SMS/Email/In-App)
    try {
      await sendOrderNotification({
        orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        items,
        totalAmount: order.totalAmount,
        status: order.status
      });
    } catch (notifErr) {
      console.warn('Order notification dispatch error:', notifErr.message);
    }

    res.status(201).json({ success: true, orderId, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { $or: [{ orderId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] },
      { status },
      { new: true }
    );

    if (order) {
      try {
        await sendOrderStatusUpdate(order.orderId || req.params.id, status, {
          email: order.customerEmail,
          phone: order.customerPhone
        });
      } catch (notifErr) {
        console.warn('Status update notification error:', notifErr.message);
      }
    }

    res.json({ success: true, message: `Status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findOneAndDelete({
      $or: [{ orderId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }]
    });
    res.json({ success: true, message: 'Order deleted from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= COUPONS (MONGODB) ================= //

app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, type, value, maxDiscount, minOrder, description } = req.body;
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { type, value, maxDiscount, minOrder, description, isActive: true },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    await Coupon.findOneAndDelete({ code: req.params.code.toUpperCase() });
    res.json({ success: true, message: 'Coupon deleted from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= DASHBOARD STATS ================= //

app.get('/api/stats', async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ stockLeft: { $lt: 10 } });

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStock
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= NOTIFICATIONS LOGS & TEST ================= //

app.get('/api/notifications', (req, res) => {
  try {
    const logs = getNotificationLogs();
    res.json({ success: true, count: logs.length, notifications: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Notification Dispatch Endpoint (OneSignal Push + Resend Email)
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { title = '🎉 Test Alert from RatuMart', message = 'Testing OneSignal & Resend integration!', email } = req.body;
    
    // Trigger test order notification
    const result = await sendOrderNotification({
      orderId: `TEST-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'RatuMart Tester',
      customerEmail: email || 'delivered@resend.dev',
      customerPhone: '+91 9999999999',
      items: [
        { name: 'Boys Royal Silk Kurta Set', price: 699, selectedSize: '4-5 Yrs', selectedColor: 'Royal Yellow', quantity: 1 }
      ],
      totalAmount: 699,
      status: 'Confirmed'
    });

    res.json({
      success: true,
      message: 'Test notification triggered via OneSignal & Resend!',
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= SERVE FRONTEND IN PRODUCTION (RENDER) ================= //

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('📦 Serving production frontend build from /dist');
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 RatuMart MongoDB Backend Server running on http://localhost:${PORT}`);
});
