const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const webpush = require("web-push");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

// ============= LOGGER UTILITY =============
class Logger {
  static log(message, data = null) {
    console.log(`[${this.getTimestamp()}] ℹ️  ${message}`, data || "");
  }

  static success(message, data = null) {
    console.log(`[${this.getTimestamp()}] ✅ ${message}`, data || "");
  }

  static warn(message, data = null) {
    console.warn(`[${this.getTimestamp()}] ⚠️  ${message}`, data || "");
  }

  static error(message, err = null) {
    console.error(`[${this.getTimestamp()}] ❌ ${message}`, err ? err.message : "");
    if (err && err.stack) console.error(err.stack);
  }

  static debug(message, data = null) {
    if (process.env.DEBUG === "true") {
      console.log(`[${this.getTimestamp()}] 🔍 ${message}`, data || "");
    }
  }

  static getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }
}

const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.static("public"));

// ✅ Default route - main.html को serve करो
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});


// ============= ERROR HANDLING MIDDLEWARE =============
// Request logging middleware
app.use((req, res, next) => {
  Logger.debug(`${req.method} ${req.path}`, { body: req.body });
  next();
});

// ============= INITIALIZE SERVICES =============
let resend;
try {
  resend = new Resend(process.env.RESEND_API_KEY);
  Logger.success("Resend initialized successfully");
} catch (err) {
  Logger.error("Failed to initialize Resend", err);
}

// ============= AUTHENTICATION MIDDLEWARE =============
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      Logger.warn("Token missing in request");
      return res.status(401).json({ 
        success: false,
        error: "Token missing" 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        Logger.warn("Invalid token:", err.message);
        return res.status(403).json({ 
          success: false,
          error: "Invalid token" 
        });
      }
      req.user = decoded;
      Logger.debug("User authenticated", { userId: decoded.userId });
      next();
    });
  } catch (err) {
    Logger.error("Authentication middleware error", err);
    res.status(500).json({ 
      success: false,
      error: "Authentication error" 
    });
  }
};

// ============= WEB PUSH SETUP =============
let vapidPublicKey, vapidPrivateKey;
try {
  vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error("VAPID keys not configured");
  }

  webpush.setVapidDetails("mailto:you@example.com", vapidPublicKey, vapidPrivateKey);
  Logger.success("Web Push configured successfully");
} catch (err) {
  Logger.error("Web Push setup failed", err);
}

const subscriptions = [];

// ============= ROUTES =============
app.use("/cart", cartRoutes);

// ============= SIGNUP ENDPOINT =============
app.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, address, pincode, area } = req.body;
    
    Logger.log("Signup request received", { phone, email });

    // Validation
    if (![name, phone, email, address, pincode, area].every(Boolean)) {
      Logger.warn("Signup validation failed - missing fields", { phone });
      return res.status(400).json({ 
        success: false,
        error: "सभी फ़ील्ड आवश्यक हैं" 
      });
    }

    // Check if user exists
    const exists = await User.findOne({ $or: [{ phone }, { email }] });
    if (exists) {
      Logger.warn("Signup failed - user already exists", { phone, email });
      return res.status(409).json({ 
        success: false,
        error: "User पहले से मौजूद है" 
      });
    }

    // Create new user
    const newUser = await new User({ name, phone, email, address, pincode, area }).save();
    Logger.debug("User document created", { userId: newUser._id });
    
    // Create cart for user
    const newCart = await new Cart({ user: newUser._id, items: [], totalPrice: 0 }).save();
    Logger.debug("Cart created", { cartId: newCart._id });

    newUser.cart = newCart._id;
    await newUser.save();

    Logger.success("User signup successful", { userId: newUser._id, phone });

    res.status(201).json({ 
      success: true,
      message: "Signup सफल", 
      userId: newUser._id 
    });
  } catch (err) {
    Logger.error("Signup endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "Signup failed: " + err.message 
    });
  }
});

// ============= OTP STORAGE =============
const otpStore = {};

// ============= SEND OTP FUNCTION =============
const sendOtp = async (phone, subject) => {
  try {
    Logger.log("Attempting to send OTP", { phone });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      Logger.warn("User not found for OTP send", { phone });
      return null;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { 
      otp, 
      expires: Date.now() + 120000,
      attempts: 0 
    };

    Logger.debug("OTP generated and stored", { phone });

    // Send email via Resend
    await resend.emails.send({
      from: `Ratu Fresh <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: user.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">आपका OTP</h2>
          <p style="font-size: 18px; color: #666;">कृपया यह OTP दर्ज करें:</p>
          <h1 style="color: #00c9a7; font-size: 36px; letter-spacing: 5px; text-align: center; margin: 20px 0;">
            ${otp}
          </h1>
          <p style="color: #999; font-size: 14px;">यह OTP 2 मिनट के लिए मान्य है।</p>
          <p style="color: #999; font-size: 12px;">अगर आपने यह OTP नहीं मांगा है, तो इसे अनदेखा करें।</p>
        </div>
      `
    });

    Logger.success("OTP sent successfully", { phone, email: user.email });
    return user.email;
  } catch (err) {
    Logger.error("Send OTP error", err);
    throw err;
  }
};

// ============= LOGIN ENDPOINT =============
app.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    Logger.log("Login request received", { phone });

    // Validation
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      Logger.warn("Login validation failed - invalid phone", { phone });
      return res.status(400).json({ 
        success: false,
        error: "❌ Valid 10-digit phone number दर्ज करें" 
      });
    }

    // Find user
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      Logger.warn("Login failed - user not found", { phone });
      return res.status(404).json({ 
        success: false,
        error: "❌ User not found। पहले Sign Up करें" 
      });
    }

    Logger.debug("User found in database", { userId: user._id });

    // Send OTP
    const email = await sendOtp(phone, "🔐 आपका OTP - Ratu Fresh");
    
    if (!email) {
      Logger.error("Login failed - OTP send failed", null);
      return res.status(500).json({ 
        success: false,
        error: "❌ OTP भेजने में समस्या" 
      });
    }

    Logger.success("Login OTP sent", { phone, email });

    res.json({ 
      success: true, 
      message: "OTP भेजा गया", 
      email: email
    });

  } catch (err) {
    Logger.error("Login endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
});

// ============= RESEND OTP ENDPOINT =============
app.post("/resend-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    Logger.log("Resend OTP request received", { phone });

    if (!phone) {
      Logger.warn("Resend OTP failed - no phone provided");
      return res.status(400).json({ 
        success: false,
        error: "Phone number required" 
      });
    }

    const email = await sendOtp(phone, "🔁 नया OTP - Ratu Fresh");
    
    if (!email) {
      Logger.warn("Resend OTP failed - user not found", { phone });
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    Logger.success("OTP resent successfully", { phone });

    res.json({ 
      success: true, 
      message: "नया OTP भेजा गया" 
    });

  } catch (err) {
    Logger.error("Resend OTP endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ============= VERIFY OTP ENDPOINT =============
app.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    Logger.log("OTP verification request received", { phone });

    if (!phone || !otp) {
      Logger.warn("OTP verification failed - missing parameters");
      return res.status(400).json({ 
        success: false,
        error: "Phone और OTP दोनों आवश्यक हैं" 
      });
    }

    const record = otpStore[phone];

    // Check if OTP record exists
    if (!record) {
      Logger.warn("OTP verification failed - no record found", { phone });
      return res.status(400).json({ 
        success: false,
        error: "OTP नहीं भेजा गया या समाप्त हो गया" 
      });
    }

    // Check OTP value
    if (String(record.otp) !== String(otp)) {
      record.attempts = (record.attempts || 0) + 1;
      Logger.warn("OTP verification failed - invalid OTP", { phone, attempts: record.attempts });
      
      if (record.attempts >= 3) {
        delete otpStore[phone];
        Logger.warn("OTP blocked - too many attempts", { phone });
        return res.status(429).json({ 
          success: false,
          error: "बहुत सारे प्रयास। फिर से OTP भेजें" 
        });
      }

      return res.status(401).json({ 
        success: false,
        error: "OTP गलत है" 
      });
    }

    // Check OTP expiry
    if (Date.now() > record.expires) {
      Logger.warn("OTP verification failed - OTP expired", { phone });
      delete otpStore[phone];
      return res.status(401).json({ 
        success: false,
        error: "OTP समाप्त हो गया" 
      });
    }

    // Find user
    const user = await User.findOne({ phone: phone.trim() }).populate("cart");
    if (!user) {
      Logger.warn("OTP verification failed - user not found", { phone });
      return res.status(404).json({ 
        success: false,
        error: "User नहीं मिला" 
      });
    }

    // Delete OTP after verification
    delete otpStore[phone];

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, phone }, 
      process.env.JWT_SECRET, 
      { expiresIn: "2h" }
    );

    Logger.success("OTP verification successful", { userId: user._id, phone });

    res.json({ success: true, token, user });

  } catch (err) {
    Logger.error("OTP verification endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
});

// ============= PLACE ORDER ENDPOINT =============
app.post("/place-order", authenticate, async (req, res) => {
  try {
    const { products, totalPrice, customerName, address, phone } = req.body;
    
    Logger.log("Order placement request received", { 
      userId: req.user.userId,
      totalPrice,
      itemCount: products?.length 
    });

    if (![products, totalPrice, customerName, address, phone].every(Boolean)) {
      Logger.warn("Order validation failed - missing fields", { userId: req.user.userId });
      return res.status(400).json({ 
        success: false,
        error: "सभी फ़ील्ड आवश्यक हैं" 
      });
    }

    // Create order
    const order = await new Order({
      userId: req.user.userId,
      items: products.map(p => ({
        productId: p.productId || p.name,
        name: p.name,
        quantity: p.qty,
        price: p.price || 0
      })),
      totalAmount: totalPrice,
      deliveryAddress: address,
      phone,
      paymentMode: "Cash on Delivery"
    }).save();

    Logger.debug("Order created in database", { orderId: order._id });

    const productList = products
      .map(p => `- ${p.name} (${p.qty < 1 ? p.qty * 1000 + " ग्राम" : p.qty + " किलो"})`)
      .join("\n");

    // Send order email
    try {
      await resend.emails.send({
        from: `Ratu Fresh <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: "ck805026@gmail.com",
        subject: "🛒 नया ऑर्डर प्राप्त हुआ - Ratu Fresh",
        html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333;">🛒 नया ऑर्डर प्राप्त हुआ</h2>
            <p style="color: #666;"><strong>ग्राहक:</strong> ${customerName}</p>
            <p style="color: #666;"><strong>फोन:</strong> ${phone}</p>
            <p style="color: #666;"><strong>पता:</strong> ${address}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <h3 style="color: #333;">ऑर्डर विवरण:</h3>
            <pre style="background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto;">${productList}</pre>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #00c9a7; font-size: 18px; font-weight: bold;"><strong>कुल कीमत: ₹${totalPrice}</strong></p>
          </div>
        `
      });
      Logger.success("Order confirmation email sent");
    } catch (emailErr) {
      Logger.warn("Order email failed - will not affect order", emailErr);
    }

    Logger.success("Order created successfully", { orderId: order._id, phone });

    res.json({ 
      success: true,
      message: "ऑर्डर सफल", 
      orderId: order._id 
    });
  } catch (err) {
    Logger.error("Place order endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// ============= PUSH NOTIFICATION ENDPOINTS =============
app.post("/subscribe", async (req, res) => {
  try {
    const { subscription, phone } = req.body;
    
    if (!subscription || !phone) {
      Logger.warn("Subscribe failed - missing parameters");
      return res.status(400).json({ success: false, error: "Invalid parameters" });
    }

    subscriptions.push({ subscription, phone });
    Logger.success("User subscribed to push notifications", { phone });
    res.status(201).json({ success: true });
  } catch (err) {
    Logger.error("Subscribe endpoint error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/send", async (req, res) => {
  try {
    const { phone, payload } = req.body;
    
    Logger.log("Sending notification to specific user", { phone });

    const targets = subscriptions.filter(s => s.phone === phone).map(s => s.subscription);
    
    const results = await Promise.all(
      targets.map(sub =>
        webpush.sendNotification(sub, JSON.stringify(payload))
          .then(() => ({ ok: true }))
          .catch(err => {
            Logger.warn("Push notification send failed", err);
            return ({ ok: false, error: err.message });
          })
      )
    );
    
    const succeeded = results.filter(r => r.ok).length;
    Logger.success(`Notifications sent`, { phone, total: results.length, succeeded });

    res.json({ total: results.length, succeeded, failed: results.length - succeeded });
  } catch (err) {
    Logger.error("Send notification endpoint error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/send-all", async (req, res) => {
  try {
    const { payload } = req.body;
    
    Logger.log("Broadcasting notification to all users", { userCount: subscriptions.length });

    const results = await Promise.all(
      subscriptions.map(({ subscription }) =>
        webpush.sendNotification(subscription, JSON.stringify(payload))
          .then(() => ({ ok: true }))
          .catch(err => {
            Logger.warn("Broadcast notification failed", err);
            return ({ ok: false, error: err.message });
          })
      )
    );
    
    const succeeded = results.filter(r => r.ok).length;
    Logger.success(`Broadcast completed`, { total: results.length, succeeded });

    res.json({ total: results.length, succeeded, failed: results.length - succeeded });
  } catch (err) {
    Logger.error("Broadcast endpoint error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= GEOCODING ENDPOINTS =============
app.post("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    Logger.debug("Reverse geocoding request", { lat, lng });

    if (typeof lat !== "number" || typeof lng !== "number") {
      Logger.warn("Reverse geocoding failed - invalid coordinates");
      return res.status(400).json({ success: false, error: "Invalid coordinates" });
    }
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const { data } = await axios.get(url, { 
      headers: { "User-Agent": "RatuFresh/1.0" },
      timeout: 5000
    });
    
    if (!data?.display_name) {
      Logger.warn("Reverse geocoding - address not found", { lat, lng });
      return res.status(404).json({ success: false, error: "Address not found" });
    }
    
    Logger.success("Reverse geocoding successful", { address: data.display_name });
    res.json({ displayName: data.display_name, components: data.address || {} });
  } catch (err) {
    Logger.error("Reverse geocoding error", err);
    res.status(500).json({ success: false, error: "Reverse geocoding failed" });
  }
});

app.post("/geocode", async (req, res) => {
  try {
    const { address, area, pincode } = req.body;
    const query = [address, area, pincode].filter(Boolean).join(", ");
    
    Logger.debug("Geocoding request", { query });

    if (!query) {
      Logger.warn("Geocoding failed - no address provided");
      return res.status(400).json({ success: false, error: "Address is required" });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { 
      headers: { "User-Agent": "RatuFresh/1.0" },
      timeout: 5000
    });
    
    if (!Array.isArray(data) || !data.length) {
      Logger.warn("Geocoding - location not found", { query });
      return res.status(404).json({ success: false, error: "Location not found" });
    }
    
    const match = data[0];
    Logger.success("Geocoding successful", { query, displayName: match.display_name });
    res.json({ 
      lat: parseFloat(match.lat), 
      lng: parseFloat(match.lon), 
      displayName: match.display_name 
    });
  } catch (err) {
    Logger.error("Geocoding error", err);
    res.status(500).json({ success: false, error: "Geocoding failed" });
  }
});

// ============= ADMIN ENDPOINT =============
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ratufresh@2025';

app.get('/admin', (req, res) => {
  try {
    const { password } = req.query;
    
    if (password !== ADMIN_PASSWORD) {
      Logger.warn("Unauthorized admin access attempt");
      return res.status(401).send('Unauthorized');
    }

    Logger.log("Admin panel accessed");
    res.sendFile(path.join(__dirname, 'secure', 'admin.html'));
  } catch (err) {
    Logger.error("Admin endpoint error", err);
    res.status(500).send('Error loading admin panel');
  }
});

// ============= HEALTH CHECK =============
app.get('/health', (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  Logger.warn("404 - Route not found", { method: req.method, path: req.path });
  res.status(404).json({ success: false, error: "Route not found" });
});

// ============= GLOBAL ERROR HANDLER =============
app.use((err, req, res, next) => {
  Logger.error("Global error handler triggered", err);
  res.status(err.status || 500).json({ 
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Server error" 
      : err.message 
  });
});

// ============= DATABASE CONNECTION & SERVER START =============
async function startServer() {
  try {
    Logger.log("Starting server...");

    // Check environment variables
    if (!process.env.DBurl) throw new Error("DBurl not configured");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    Logger.log("Environment variables verified");

    // Connect to MongoDB
    await mongoose.connect(process.env.DBurl, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    Logger.success("MongoDB connected successfully");

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      Logger.success(`🚀 Server is running on port ${PORT}`);
      Logger.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      Logger.log(`🔗 Database: Connected`);
      Logger.log(`📧 Email Service: Resend configured`);
    });

  } catch (err) {
    Logger.error("Failed to start server", err);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error("Unhandled Rejection at:", reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start server
startServer();

module.exports = app;

