// ============= IMPORTS =============
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
    return new Date().toISOString();
  }
}

// ============= DATABASE MODELS =============
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");

// ============= EXPRESS SETUP =============
const app = express();

// ============= MIDDLEWARE =============
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ============= REQUEST LOGGING =============
app.use((req, res, next) => {
  Logger.debug(`${req.method} ${req.path}`);
  next();
});

// ============= HTML ROUTES - SERVE PAGES =============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/otp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'otp.html'));
});

app.get('/profiles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profiles.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/order', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order.html'));
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
      return res.status(401).json({ success: false, error: "Token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        Logger.warn("Invalid token:", err.message);
        return res.status(403).json({ success: false, error: "Invalid token" });
      }
      req.user = decoded;
      Logger.debug("User authenticated", { userId: decoded.userId });
      next();
    });
  } catch (err) {
    Logger.error("Authentication middleware error", err);
    res.status(500).json({ success: false, error: "Authentication error" });
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

// ============= OTP STORAGE =============
const otpStore = {};

// ============= SEND OTP FUNCTION =============
const sendOtp = async (phone, subject) => {
  try {
    Logger.log("🔄 Attempting to send OTP", { phone });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      Logger.warn("User not found for OTP send", { phone });
      return null;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { 
      otp, 
      expires: Date.now() + 120000, 
      attempts: 0,
      createdAt: new Date()
    };

    Logger.debug("📝 OTP generated", { phone, otp });

    await resend.emails.send({
      from: "Ratu Fresh <onboarding@resend.dev>",
      to: user.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: #fff; margin-bottom: 30px;">🔐 Ratu Fresh</h1>
          <h2 style="color: #fff; font-size: 28px; margin-bottom: 20px;">आपका OTP कोड</h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 30px;">यह कोड 2 मिनट के लिए मान्य है</p>
          <div style="background: rgba(255,255,255,0.2); padding: 30px; border-radius: 10px; margin: 30px 0;">
            <h1 style="color: #fff; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 30px;">
            अगर आपने यह OTP नहीं मांगा है, तो इसे अनदेखा करें।
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.3); margin: 30px 0;">
          <p style="color: rgba(255,255,255,0.7); font-size: 12px;">
            © 2025 Ratu Fresh - ताज़ी सब्जियाँ, तेज़ डिलीवरी
          </p>
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

// ============= SIGNUP ENDPOINT =============
app.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, address, pincode, area } = req.body;
    
    Logger.log("Signup request received", { phone, email });

    if (![name, phone, email, address, pincode, area].every(Boolean)) {
      Logger.warn("Signup validation failed - missing fields", { phone });
      return res.status(400).json({ success: false, error: "सभी फ़ील्ड आवश्यक हैं" });
    }

    const exists = await User.findOne({ $or: [{ phone }, { email }] });
    if (exists) {
      Logger.warn("Signup failed - user already exists", { phone, email });
      return res.status(409).json({ success: false, error: "User पहले से मौजूद है" });
    }

    const newUser = await new User({ name, phone, email, address, pincode, area }).save();
    Logger.debug("User document created", { userId: newUser._id });
    
    const newCart = await new Cart({ user: newUser._id, items: [], totalPrice: 0 }).save();
    Logger.debug("Cart created", { cartId: newCart._id });

    newUser.cart = newCart._id;
    await newUser.save();

    Logger.success("User signup successful", { userId: newUser._id, phone });

    res.status(201).json({ success: true, message: "Signup सफल", userId: newUser._id });
  } catch (err) {
    Logger.error("Signup endpoint error", err);
    res.status(500).json({ success: false, error: "Signup failed: " + err.message });
  }
});

// ============= LOGIN ENDPOINT =============
app.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;
    Logger.log("Login request received", { phone });

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      Logger.warn("Login validation failed - invalid phone", { phone });
      return res.status(400).json({ success: false, error: "Valid 10-digit phone number दर्ज करें" });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      Logger.warn("Login failed - user not found", { phone });
      return res.status(404).json({ success: false, error: "User not found। पहले Sign Up करें" });
    }

    Logger.debug("User found in database", { userId: user._id });

    const email = await sendOtp(phone, "🔐 आपका OTP - Ratu Fresh");
    
    if (!email) {
      Logger.error("Login failed - OTP send failed", null);
      return res.status(500).json({ success: false, error: "OTP भेजने में समस्या" });
    }

    Logger.success("Login OTP sent", { phone, email });

    res.json({ success: true, message: "OTP भेजा गया", email });
  } catch (err) {
    Logger.error("Login endpoint error", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
});

// ============= RESEND OTP ENDPOINT =============
app.post("/resend-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    Logger.log("Resend OTP request received", { phone });

    if (!phone) {
      Logger.warn("Resend OTP failed - no phone provided");
      return res.status(400).json({ success: false, error: "Phone number required" });
    }

    const email = await sendOtp(phone, "🔁 नया OTP - Ratu Fresh");
    
    if (!email) {
      Logger.warn("Resend OTP failed - user not found", { phone });
      return res.status(404).json({ success: false, error: "User not found" });
    }

    Logger.success("OTP resent successfully", { phone });
    res.json({ success: true, message: "नया OTP भेजा गया" });
  } catch (err) {
    Logger.error("Resend OTP endpoint error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= VERIFY OTP ENDPOINT =============
app.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    Logger.log("OTP verification request received", { phone });

    if (!phone || !otp) {
      Logger.warn("OTP verification failed - missing parameters");
      return res.status(400).json({ success: false, error: "Phone और OTP दोनों आवश्यक हैं" });
    }

    const record = otpStore[phone];

    if (!record) {
      Logger.warn("OTP verification failed - no record found", { phone });
      return res.status(400).json({ success: false, error: "OTP नहीं भेजा गया या समाप्त हो गया" });
    }

    if (String(record.otp) !== String(otp)) {
      record.attempts = (record.attempts || 0) + 1;
      Logger.warn("OTP verification failed - invalid OTP", { phone, attempts: record.attempts });
      
      if (record.attempts >= 3) {
        delete otpStore[phone];
        Logger.warn("OTP blocked - too many attempts", { phone });
        return res.status(429).json({ success: false, error: "बहुत सारे प्रयास। फिर से OTP भेजें" });
      }

      return res.status(401).json({ success: false, error: "OTP गलत है" });
    }

    if (Date.now() > record.expires) {
      Logger.warn("OTP verification failed - OTP expired", { phone });
      delete otpStore[phone];
      return res.status(401).json({ success: false, error: "OTP समाप्त हो गया" });
    }

    const user = await User.findOne({ phone: phone.trim() }).populate("cart");
    if (!user) {
      Logger.warn("OTP verification failed - user not found", { phone });
      return res.status(404).json({ success: false, error: "User नहीं मिला" });
    }

    delete otpStore[phone];

    const token = jwt.sign({ userId: user._id, phone }, process.env.JWT_SECRET, { expiresIn: "2h" });

    Logger.success("OTP verification successful", { userId: user._id, phone });

    res.json({ 
      success: true, 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        pincode: user.pincode,
        area: user.area
      }
    });
  } catch (err) {
    Logger.error("OTP verification endpoint error", err);
    res.status(500).json({ success: false, error: "Server error: " + err.message });
  }
});

// ============= ADD TO CART ENDPOINT =============
app.post("/cart/add/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, name, qty, price } = req.body;

    Logger.log("🛒 Adding to cart", { userId, name, qty, price });

    if (!name || !qty || !price) {
      Logger.warn("❌ Invalid cart data", { userId });
      return res.status(400).json({ 
        success: false,
        error: "सभी फ़ील्ड आवश्यक हैं" 
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      Logger.debug("📝 Creating new cart", { userId });
      cart = await new Cart({ 
        user: userId, 
        items: [],
        totalPrice: 0
      }).save();
    }

    const existingItem = cart.items.find(item => item.name === name);

    if (existingItem) {
      existingItem.quantity += qty;
      Logger.debug("📊 Updated quantity", { name, newQty: existingItem.quantity });
    } else {
      cart.items.push({
        productId: productId || name,
        name,
        quantity: qty,
        price
      });
      Logger.debug("➕ Added new item", { name, qty });
    }

    cart.totalPrice = cart.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );

    await cart.save();

    Logger.success("✅ Item added to cart", { userId, name, totalPrice: cart.totalPrice });

    res.json({ 
      success: true,
      message: `✅ ${name} कार्ट में जोड़ा गया`,
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice
      }
    });

  } catch (err) {
    Logger.error("Add to cart endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "कार्ट में जोड़ने में समस्या: " + err.message 
    });
  }
});

// ============= GET CART ENDPOINT =============
app.get('/cart/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    Logger.log("🛒 Fetching cart for user:", userId);

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      Logger.warn("❌ Cart not found, creating new", { userId });
      cart = await new Cart({ 
        user: userId, 
        items: [],
        totalPrice: 0
      }).save();
    }

    Logger.success("✅ Cart fetched", { userId, itemCount: cart.items.length });

    res.json({ 
      success: true,
      items: cart.items,
      totalPrice: cart.totalPrice
    });

  } catch (err) {
    Logger.error("Get cart endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "कार्ट fetch करने में समस्या: " + err.message 
    });
  }
});

// ============= REMOVE FROM CART =============
app.post("/cart/remove/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    Logger.log("🗑️ Removing from cart", { userId, productId });

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      Logger.warn("❌ Cart not found", { userId });
      return res.status(404).json({ 
        success: false,
        error: "कार्ट नहीं मिला" 
      });
    }

    cart.items = cart.items.filter(item => item.name !== productId);

    cart.totalPrice = cart.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );

    await cart.save();

    Logger.success("✅ Item removed from cart", { userId });

    res.json({ 
      success: true,
      message: "आइटम हटा दिया गया",
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice
      }
    });

  } catch (err) {
    Logger.error("Remove from cart error", err);
    res.status(500).json({ 
      success: false,
      error: "हटाने में समस्या: " + err.message 
    });
  }
});

// ============= CLEAR CART =============
app.post("/cart/clear/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    Logger.log("🧹 Clearing cart", { userId });

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      Logger.warn("❌ Cart not found", { userId });
      return res.status(404).json({ 
        success: false,
        error: "कार्ट नहीं मिला" 
      });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    Logger.success("✅ Cart cleared", { userId });

    res.json({ 
      success: true,
      message: "कार्ट साफ़ कर दिया गया"
    });

  } catch (err) {
    Logger.error("Clear cart error", err);
    res.status(500).json({ 
      success: false,
      error: "साफ़ करने में समस्या: " + err.message 
    });
  }
});

// ============= PLACE ORDER ENDPOINT =============
app.post("/place-order", authenticate, async (req, res) => {
  try {
    const { products, totalPrice, customerName, address, phone } = req.body;
    
    Logger.log("📦 Order placement request received", { userId: req.user.userId, totalPrice, itemCount: products?.length });

    if (![products, totalPrice, customerName, address, phone].every(Boolean)) {
      Logger.warn("Order validation failed - missing fields", { userId: req.user.userId });
      return res.status(400).json({ success: false, error: "सभी फ़ील्ड आवश्यक हैं" });
    }

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
      status: "pending",
      paymentMode: "Cash on Delivery",
      orderDate: new Date()
    }).save();

    Logger.debug("Order created in database", { orderId: order._id });

    const productList = products
      .map(p => `- ${p.name} (${p.qty < 1 ? p.qty * 1000 + " ग्राम" : p.qty + " किलो"})`)
      .join("\n");

    try {
      await resend.emails.send({
        from: "Ratu Fresh <onboarding@resend.dev>",
        to: "ck805026@gmail.com",
        subject: "🛒 नया ऑर्डर प्राप्त हुआ - Ratu Fresh",
        html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333;">🛒 नया ऑर्डर प्राप्त हुआ</h2>
            <p><strong>ग्राहक:</strong> ${customerName}</p>
            <p><strong>फोन:</strong> ${phone}</p>
            <p><strong>पता:</strong> ${address}</p>
            <hr>
            <h3>ऑर्डर विवरण:</h3>
            <pre>${productList}</pre>
            <p><strong>कुल कीमत: ₹${totalPrice}</strong></p>
          </div>
        `
      });
      Logger.success("Order confirmation email sent");
    } catch (emailErr) {
      Logger.warn("Order email failed - will not affect order", emailErr);
    }

    Logger.success("Order created successfully", { orderId: order._id, phone });
    res.json({ success: true, message: "ऑर्डर सफल", orderId: order._id });
  } catch (err) {
    Logger.error("Place order endpoint error", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============= GET ORDERS ENDPOINT =============
app.get('/orders/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    Logger.log("📦 Fetching orders for user:", userId);

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    if (!orders || orders.length === 0) {
      Logger.warn("❌ No orders found", { userId });
      return res.json({ 
        success: true,
        orders: [],
        message: "कोई ऑर्डर नहीं मिला"
      });
    }

    Logger.success("✅ Orders fetched", { userId, count: orders.length });
    
    res.json({ 
      success: true,
      orders: orders.map(order => ({
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status || 'pending',
        orderDate: order.orderDate || order.createdAt,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        phone: order.phone
      }))
    });

  } catch (err) {
    Logger.error("Get orders endpoint error", err);
    res.status(500).json({ 
      success: false,
      error: "Orders fetch failed: " + err.message 
    });
  }
});

// ============= PUSH NOTIFICATIONS - SUBSCRIBE =============
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

// ============= PUSH NOTIFICATIONS - SEND TO SPECIFIC USER =============
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

// ============= PUSH NOTIFICATIONS - BROADCAST =============
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

// ============= GEOCODING - REVERSE =============
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

// ============= GEOCODING - FORWARD =============
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
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message 
  });
});

// ============= DATABASE CONNECTION & SERVER START =============
async function startServer() {
  try {
    Logger.log("Starting server...");

    if (!process.env.DBurl) throw new Error("DBurl not configured");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    Logger.log("Environment variables verified");

    await mongoose.connect(process.env.DBurl, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    Logger.success("MongoDB connected successfully");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      Logger.success(`🚀 Server is running on port ${PORT}`);
      Logger.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      Logger.log(`🔗 Database: Connected`);
      Logger.log(`📧 Email Service: Resend configured`);
      Logger.log(`🌐 Website: http://localhost:${PORT}`);
    });
  } catch (err) {
    Logger.error("Failed to start server", err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  Logger.error("Unhandled Rejection at:", reason);
});

process.on('uncaughtException', (error) => {
  Logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();

module.exports = app;
