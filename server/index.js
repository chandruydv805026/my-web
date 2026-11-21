import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
  sendEmailVerificationOtp,
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
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Helper function to set bank-grade HTTP-only session cookie
const setSessionCookie = (res, token) => {
  res.cookie('ratumart_session', token, {
    httpOnly: true, // Prevents XSS script attacks from stealing token
    secure: process.env.NODE_ENV === 'production', // Encrypted over HTTPS in production
    sameSite: 'lax', // CSRF protection
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 Days (3 Months) Persistent Session
  });
};

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
      console.log('Seeding initial clothes inventory in MongoDB (Kids, Men, Women)...');
      await Product.insertMany([
        // 1. Kids Wear
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
          tag: "Kids Party Bestseller",
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
          description: "Royal 3-piece tailored suit set for boys, ideal for birthdays, weddings, and festive occasions."
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
          tag: "Girls Birthday Gown",
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
          description: "Princess party frock for girls crafted with 100% scratch-free pure cotton inner lining."
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
          description: "Comfortable traditional art silk kurta dhoti set for boys, perfect for festivals and puja ceremonies."
        },

        // 2. Men's Fashion
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
          description: "Rugged denim biker jacket for men featuring heavyweight premium cotton."
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
          tag: "Festive Wedding Special",
          image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80",
          images: ["https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80"],
          sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"],
          colors: ["Cream Gold", "Wine Red", "Navy Sapphire"],
          fabric: "Rich Silk Blend Jacquard Weave",
          fit: "Straight Classic Fit with Mandarin Collar",
          washCare: "Dry Clean Only",
          stockLeft: 12,
          deliveryDays: "Tomorrow, 1:00 PM",
          description: "Regal self-embossed floral Jacquard kurta set for men designed for traditional ceremonies."
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
          description: "Breathable pure linen-cotton casual shirt designed for all-day comfort and office wear."
        },

        // 3. Women's Fashion
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
          description: "Exquisite Banarasi silk saree featuring heavy gold Zari woven borders for weddings and festivities."
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
          description: "Handcrafted mirror-work Anarkali 3-piece ensemble paired with a scalloped organza dupatta."
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
          description: "Heavy wedding bridal lehenga set with intricate gold threadwork and double dupatta."
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
          description: "Chic French floral print chiffon maxi dress featuring an elasticated smocked waist."
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

// In-memory OTP storage for registration confirmation (keyed by lowercase email)
const emailOtpStore = new Map();

// Store Location Center: Dandai Phutaltoli, Ratu, Ranchi - 835222
const STORE_COORDS = {
  lat: 23.414532,
  lng: 85.216414,
  name: "Dandai Phutaltoli, Ratu, Ranchi",
  pincode: "835222",
  maxRadiusKm: 5.0
};

function calcHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Exact Sateek Reverse-Geocode & Live Location Verification Endpoint
app.get('/api/location/reverse-geocode', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid GPS coordinates provided.' });
    }

    const distanceKm = Math.round(calcHaversineDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng) * 10) / 10;
    const isDeliverable = distanceKm <= STORE_COORDS.maxRadiusKm;

    let locationDetails = {
      area: '',
      town: 'Ratu',
      city: 'Ranchi',
      state: 'Jharkhand',
      pincode: '835222',
      formatted: ''
    };

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RatuMart-Geo/1.0 (support@ratumart.com)',
            'Accept-Language': 'en'
          },
          signal: AbortSignal.timeout(4500)
        }
      );

      if (geoRes.ok) {
        const data = await geoRes.json();
        const addr = data.address || {};
        
        const area = addr.suburb || addr.neighbourhood || addr.village || addr.residential || addr.road || addr.county || 'Ratu Area';
        const town = addr.town || addr.city_district || addr.county || 'Ratu';
        const city = addr.city || addr.state_district || 'Ranchi';
        const rawPin = addr.postcode || '835222';
        const cleanPin = rawPin.replace(/\D/g, '').slice(0, 6) || '835222';
        const state = addr.state || 'Jharkhand';

        locationDetails = {
          area,
          town,
          city: city.includes('Ranchi') ? 'Ranchi' : city,
          state,
          pincode: cleanPin,
          formatted: `${area}, ${town}, ${city} - ${cleanPin}`
        };
      }
    } catch (geoErr) {
      console.warn('Reverse Geocoding Notice:', geoErr.message);
      locationDetails.formatted = distanceKm <= 5.0 ? 'Dandai Phutaltoli, Ratu, Ranchi - 835222' : 'Outside 5 KM Delivery Zone';
    }

    return res.json({
      success: true,
      lat,
      lng,
      distanceKm,
      isDeliverable,
      maxRadiusKm: STORE_COORDS.maxRadiusKm,
      storeName: STORE_COORDS.name,
      address: locationDetails
    });
  } catch (err) {
    console.error('Reverse Geocode Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reverse geocode location.' });
  }
});

// ================= PASSWORDLESS OTP LOGIN & GEOFENCE AUTH ROUTES ================= //

// A. Request Login OTP (by Phone Number OR Email)
app.post('/api/auth/login-otp-request', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your Mobile Number or Email Address.' });
    }

    const cleanInput = identifier.trim();
    let user;

    if (cleanInput.includes('@')) {
      user = await User.findOne({ email: cleanInput.toLowerCase() });
    } else {
      const phoneDigits = cleanInput.replace(/\D/g, '').slice(-10);
      if (phoneDigits.length < 10) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number or email.' });
      }
      user = await User.findOne({ phone: new RegExp(phoneDigits + '$') });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No account found with this Phone/Email. Please create a new account.'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    emailOtpStore.set(user.email, {
      code,
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: 'LOGIN',
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    console.log(`🔑 [LOGIN OTP] User: ${user.name} (${user.email}) | Phone: ${user.phone} | Code: ${code}`);

    try {
      await sendEmailVerificationOtp({ email: user.email, name: user.name, code });
    } catch (e) {
      console.warn('⚠️ Login OTP email send error:', e.message);
    }

    const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (_, g1, g2) => g1 + '*'.repeat(Math.max(1, g2.length)));

    res.json({
      success: true,
      email: user.email,
      maskedEmail,
      message: `Verification code sent to your registered email (${maskedEmail}).`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// B. Verify Login OTP
app.post('/api/auth/login-otp-verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Please provide Email and 6-digit verification code.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = emailOtpStore.get(cleanEmail);

    if (!stored || stored.type !== 'LOGIN') {
      return res.status(400).json({ success: false, message: 'No active login code found or it has expired. Please request a new code.' });
    }

    if (Date.now() > stored.expiresAt) {
      emailOtpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email and try again.' });
    }

    emailOtpStore.delete(cleanEmail);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '90d' });
    setSessionCookie(res, token);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 🎉`,
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// C. Request Register OTP with Address and 5 KM Geofence Check
app.post('/api/auth/register-otp-request', async (req, res) => {
  try {
    const { name, email, phone, address, location } = req.body;
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Please fill all required personal and delivery details.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, '').slice(-10);

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account is already registered with this email. Please sign in.' });
    }

    const existingPhone = await User.findOne({ phone: new RegExp(phoneDigits + '$') });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'An account is already registered with this mobile number. Please sign in.' });
    }

    // 5 KM Geofence Check
    let distanceKm = 0;
    if (location && location.lat && location.lng) {
      distanceKm = calcHaversineDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, location.lat, location.lng);
      if (distanceKm > STORE_COORDS.maxRadiusKm) {
        return res.status(400).json({
          success: false,
          distanceKm,
          message: `Delivery Unavailable: We strictly deliver within a 5.0 KM radius of Ratu, Ranchi. Your location is ${distanceKm} KM away.`
        });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    emailOtpStore.set(cleanEmail, {
      code,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      address: {
        ...address,
        lat: location?.lat || STORE_COORDS.lat,
        lng: location?.lng || STORE_COORDS.lng,
        distanceKm
      },
      type: 'REGISTER',
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    console.log(`🔑 [REGISTER OTP] Name: ${name} | Email: ${cleanEmail} | Distance: ${distanceKm} km | Code: ${code}`);

    try {
      await sendEmailVerificationOtp({ email: cleanEmail, name: name.trim(), code });
    } catch (e) {
      console.warn('⚠️ Register OTP email send error:', e.message);
    }

    res.json({
      success: true,
      distanceKm,
      message: `Verification code sent to ${cleanEmail}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// D. Verify Register OTP & Create Account
app.post('/api/auth/register-otp-verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Please enter Email and 6-digit confirmation code.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = emailOtpStore.get(cleanEmail);

    if (!stored || stored.type !== 'REGISTER') {
      return res.status(400).json({ success: false, message: 'No pending registration code found or it has expired.' });
    }

    if (Date.now() > stored.expiresAt) {
      emailOtpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email.' });
    }

    emailOtpStore.delete(cleanEmail);

    const user = await User.create({
      name: stored.name,
      email: stored.email,
      phone: stored.phone,
      password: '',
      address: stored.address,
      addresses: stored.address ? [stored.address] : [],
      activeAddressIndex: 0
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '90d' });
    setSessionCookie(res, token);

    try {
      await sendWelcomeNotification(user);
    } catch {}

    res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome, ${user.name}! 🎉`,
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= EMAIL AUTHENTICATION ROUTES ================= //

// 1. Send 6-Digit Email Confirmation Code
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide Full Name, Email Address, and Mobile Number.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered! Please login directly.' 
      });
    }

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    emailOtpStore.set(cleanEmail, {
      code,
      name: name.trim(),
      phone: phone.trim(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`🔑 [EMAIL OTP GENERATED] Email: ${cleanEmail} | Code: ${code} | Name: ${name} | Phone: ${phone}`);

    // Send confirmation email via Resend
    try {
      await sendEmailVerificationOtp({ email: cleanEmail, name: name.trim(), code });
    } catch (err) {
      console.warn('⚠️ OTP Email delivery notice:', err.message);
    }

    res.json({
      success: true,
      message: `Confirmation code sent to ${cleanEmail}. Please check your inbox.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify Confirmation Code & Create New Account (Passwordless)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code, name, phone } = req.body;
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide Email and the 6-digit confirmation code.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = emailOtpStore.get(cleanEmail);

    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        message: 'No pending confirmation code found or it has expired. Please request a new code.' 
      });
    }

    if (Date.now() > stored.expiresAt) {
      emailOtpStore.delete(cleanEmail);
      return res.status(400).json({ 
        success: false, 
        message: 'Confirmation code has expired. Please request a new code.' 
      });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect confirmation code! Please verify the code in your email.' 
      });
    }

    // Code verified! Remove from pending store
    emailOtpStore.delete(cleanEmail);

    // Create user without password
    const user = await User.create({
      name: stored.name || name || 'Shopper',
      email: cleanEmail,
      phone: stored.phone || phone || '',
      password: '',
      address: null
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '90d' });

    // Send Welcome Notification
    try {
      await sendWelcomeNotification(user);
    } catch (notifErr) {
      console.warn('Welcome notification error:', notifErr.message);
    }

    // Set persistent secure HTTP-Only session cookie
    setSessionCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully! 🎉',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Save User Delivery Address (Triggered right after signup)
app.post('/api/auth/save-address', async (req, res) => {
  try {
    const { email, address } = req.body;
    if (!email || !address) {
      return res.status(400).json({ success: false, message: 'Missing email or address details.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Delivery address saved successfully! 🏠',
      address: user.address,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Register with Email (Fallback direct endpoint)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide Full Name, Email, and Mobile Number.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This email is already registered! Please login.' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password: password || '',
      phone: phone || '',
      address: null
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '90d' });

    // Set persistent session cookie
    setSessionCookie(res, token);

    try {
      await sendWelcomeNotification(user);
    } catch (notifErr) {
      console.warn('Welcome notification error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Login with Email + Password or Email OTP
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, code } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please create a new account.' });
    }

    // If logging in with password (e.g. Admin or legacy users)
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password. Please check and try again.' });
      }
    } else if (code) {
      const stored = emailOtpStore.get(cleanEmail);
      if (!stored || stored.code !== code.trim()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired confirmation code.' });
      }
      emailOtpStore.delete(cleanEmail);
    } else {
      // Send login OTP if no password provided
      const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      emailOtpStore.set(cleanEmail, {
        code: loginCode,
        name: user.name,
        phone: user.phone,
        expiresAt: Date.now() + 10 * 60 * 1000
      });
      try {
        await sendEmailVerificationOtp({ email: cleanEmail, name: user.name, code: loginCode });
      } catch (e) {
        console.warn('Login OTP send error:', e.message);
      }
      return res.json({
        success: true,
        requiresOtp: true,
        message: `Login code sent to ${cleanEmail}`
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '90d' });

    // Set persistent session cookie
    setSessionCookie(res, token);

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

// 6. Get Current Authenticated User via Session Cookie (GET /api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies.ratumart_session || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No active session' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session not found' });
    }

    if (user.address && (!user.addresses || user.addresses.length === 0)) {
      user.addresses = [user.address];
      user.activeAddressIndex = 0;
      await user.save();
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or invalid' });
  }
});

// ================= USER MULTI-ADDRESS MANAGEMENT (MAX 2 ADDRESSES) ================= //

// 1. Get user addresses
app.get('/api/user/addresses', async (req, res) => {
  try {
    const token = req.cookies.ratumart_session || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if ((!user.addresses || user.addresses.length === 0) && user.address) {
      user.addresses = [user.address];
      user.activeAddressIndex = 0;
      await user.save();
    }

    res.json({
      success: true,
      addresses: user.addresses || [],
      activeAddressIndex: user.activeAddressIndex || 0,
      activeAddress: user.address || (user.addresses && user.addresses[0]) || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Manage user addresses (Add, Edit, Select, Delete - Max 2)
app.post('/api/user/addresses', async (req, res) => {
  try {
    const token = req.cookies.ratumart_session || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.addresses) user.addresses = [];
    if (user.addresses.length === 0 && user.address) {
      user.addresses.push(user.address);
      user.activeAddressIndex = 0;
    }

    const { action, address, index } = req.body;

    if (action === 'add') {
      if (user.addresses.length >= 2) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 2 delivery locations allowed per account. Please edit an existing one.'
        });
      }

      let dist = 0;
      if (address?.lat && address?.lng) {
        dist = calcHaversineDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, address.lat, address.lng);
      }

      if (dist > STORE_COORDS.maxRadiusKm) {
        return res.status(400).json({
          success: false,
          message: `This location is ${dist} KM away. We strictly deliver within 5.0 KM of Ratu Hub.`
        });
      }

      const newAddr = {
        name: address.name || user.name,
        phone: address.phone || user.phone,
        street: address.street || '',
        city: address.city || 'Ranchi',
        state: address.state || 'Jharkhand',
        pincode: address.pincode || '835222',
        landmark: address.landmark || '',
        type: address.type || 'Home',
        lat: address.lat || STORE_COORDS.lat,
        lng: address.lng || STORE_COORDS.lng,
        distanceKm: dist
      };

      user.addresses.push(newAddr);
      user.activeAddressIndex = user.addresses.length - 1;
      user.address = newAddr;
      await user.save();

      return res.json({
        success: true,
        message: 'New delivery address added successfully! 📍',
        addresses: user.addresses,
        activeAddressIndex: user.activeAddressIndex,
        user
      });
    }

    if (action === 'edit') {
      const idx = Number(index);
      if (idx < 0 || idx >= user.addresses.length) {
        return res.status(400).json({ success: false, message: 'Invalid address index.' });
      }

      let dist = user.addresses[idx].distanceKm || 0;
      if (address?.lat && address?.lng) {
        dist = calcHaversineDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, address.lat, address.lng);
      }

      if (dist > STORE_COORDS.maxRadiusKm) {
        return res.status(400).json({
          success: false,
          message: `This location is ${dist} KM away. We strictly deliver within 5.0 KM of Ratu Hub.`
        });
      }

      const updated = {
        ...user.addresses[idx].toObject(),
        ...address,
        distanceKm: dist
      };

      user.addresses[idx] = updated;
      if (user.activeAddressIndex === idx) {
        user.address = updated;
      }
      await user.save();

      return res.json({
        success: true,
        message: 'Delivery address updated successfully! ✏️',
        addresses: user.addresses,
        activeAddressIndex: user.activeAddressIndex,
        user
      });
    }

    if (action === 'select') {
      const idx = Number(index);
      if (idx < 0 || idx >= user.addresses.length) {
        return res.status(400).json({ success: false, message: 'Invalid address index.' });
      }

      user.activeAddressIndex = idx;
      user.address = user.addresses[idx];
      await user.save();

      return res.json({
        success: true,
        message: `Delivery location set to ${user.address.street || user.address.city}! 🚚`,
        addresses: user.addresses,
        activeAddressIndex: user.activeAddressIndex,
        user
      });
    }

    if (action === 'delete') {
      const idx = Number(index);
      if (user.addresses.length <= 1) {
        return res.status(400).json({ success: false, message: 'At least one delivery address is required.' });
      }

      user.addresses.splice(idx, 1);
      user.activeAddressIndex = 0;
      user.address = user.addresses[0];
      await user.save();

      return res.json({
        success: true,
        message: 'Address removed successfully.',
        addresses: user.addresses,
        activeAddressIndex: 0,
        user
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown address action.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Logout & Clear Session Cookie (POST /api/auth/logout)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('ratumart_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Session cookie cleared successfully' });
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
    if (cat.includes('kid') || nameLower.includes('boy') || nameLower.includes('girl') || nameLower.includes('child') || nameLower.includes('bachhe')) {
      audience = 'kids';
    } else if (cat.includes('women') || cat.includes('ethnic') || nameLower.includes('saree') || nameLower.includes('kurti') || nameLower.includes('lehenga') || nameLower.includes('dress') || nameLower.includes('gown') || nameLower.includes('ladki')) {
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

    // Verify 5 KM Delivery Radius
    if (addr.lat && addr.lng) {
      const dist = calcHaversineDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, addr.lat, addr.lng);
      addr.distanceKm = dist;
      if (dist > STORE_COORDS.maxRadiusKm) {
        return res.status(400).json({
          success: false,
          message: `Delivery Unavailable: We strictly deliver within a 5.0 KM radius of Ratu, Ranchi. Your location is ${dist} KM away.`
        });
      }
    }

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

const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA Fallback for Express 5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile('index.html', { root: distPath });
    }
    next();
  });
  console.log('📦 Serving production frontend build from /dist');
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 RatuMart MongoDB Backend Server running on http://localhost:${PORT}`);
});
