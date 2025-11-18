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

const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
webpush.setVapidDetails("mailto:you@example.com", vapidPublicKey, vapidPrivateKey);
const subscriptions = [];

app.use("/cart", cartRoutes);

app.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, address, pincode, area } = req.body;
    
    if (![name, phone, email, address, pincode, area].every(Boolean)) {
      return res.status(400).json({ error: "सभी फ़ील्ड आवश्यक हैं" });
    }

    const exists = await User.findOne({ $or: [{ phone }, { email }] });
    if (exists) return res.status(409).json({ error: "User पहले से मौजूद है" });

    const newUser = await new User({ name, phone, email, address, pincode, area }).save();
    const newCart = await new Cart({ user: newUser._id, items: [], totalPrice: 0 }).save();
    newUser.cart = newCart._id;
    await newUser.save();

    console.log("✅ New user created:", newUser._id);

    res.status(201).json({ message: "Signup सफल", userId: newUser._id });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Signup failed: " + err.message });
  }
});

const otpStore = {};

const sendOtp = async (phone, subject) => {
  try {
    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      console.log("❌ User not found in sendOtp:", phone);
      return null;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expires: Date.now() + 120000 };

    console.log("📧 Sending OTP to:", user.email, "OTP:", otp);

    await resend.emails.send({
      from: `Ratu Fresh <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: user.email,
      subject,
      html: `<p>आपका OTP: <strong>${otp}</strong></p><p>2 मिनट तक मान्य।</p>`
    });

    console.log("✅ OTP sent successfully");
    return user.email;
  } catch (err) {
    console.error("❌ Resend error:", err.message);
    throw err;
  }
};

app.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        error: "❌ Valid 10-digit phone number दर्ज करें" 
      });
    }

    console.log("🔄 Login attempt for phone:", phone);

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      console.log("❌ User not found for phone:", phone);
      return res.status(404).json({ 
        success: false,
        error: "❌ User not found" 
      });
    }

    console.log("✅ User found:", user.email);

    const email = await sendOtp(phone, "🔐 आपका OTP - Ratu Fresh");
    
    if (!email) {
      return res.status(500).json({ 
        success: false,
        error: "❌ OTP भेजने में समस्या" 
      });
    }

    res.json({ 
      success: true, 
      message: "OTP भेजा गया", 
      email: email
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
});

app.post("/resend-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        error: "Phone number required" 
      });
    }

    console.log("🔄 Resending OTP for phone:", phone);

    const email = await sendOtp(phone, "🔁 नया OTP - Ratu Fresh");
    
    if (!email) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "नया OTP भेजा गया" 
    });

  } catch (err) {
    console.error("❌ Resend OTP error:", err.message);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log("🔄 Verifying OTP:", otp, "for phone:", phone);

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false,
        error: "Phone और OTP दोनों आवश्यक हैं" 
      });
    }

    const record = otpStore[phone];

    if (!record) {
      console.log("❌ No OTP record found for phone:", phone);
      return res.status(400).json({ 
        success: false,
        error: "OTP नहीं भेजा गया या समाप्त हो गया" 
      });
    }

    if (String(record.otp) !== String(otp)) {
      console.log("❌ OTP mismatch. Expected:", record.otp, "Got:", otp);
      return res.status(401).json({ 
        success: false,
        error: "OTP गलत है" 
      });
    }

    if (Date.now() > record.expires) {
      console.log("❌ OTP expired");
      delete otpStore[phone];
      return res.status(401).json({ 
        success: false,
        error: "OTP समाप्त हो गया" 
      });
    }

    const user = await User.findOne({ phone: phone.trim() }).populate("cart");
    if (!user) {
      console.log("❌ User not found for phone:", phone);
      return res.status(404).json({ 
        success: false,
        error: "User नहीं मिला" 
      });
    }

    delete otpStore[phone];

    const token = jwt.sign(
      { userId: user._id, phone }, 
      process.env.JWT_SECRET, 
      { expiresIn: "2h" }
    );

    console.log("✅ OTP verified successfully for user:", user._id);

    res.json({ success: true, token, user });

  } catch (err) {
    console.error("❌ Verify OTP error:", err.message);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + err.message 
    });
  }
});

app.post("/place-order", authenticate, async (req, res) => {
  try {
    const { products, totalPrice, customerName, address, phone } = req.body;
    if (![products, totalPrice, customerName, address, phone].every(Boolean)) {
      return res.status(400).json({ error: "सभी फ़ील्ड आवश्यक हैं" });
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
      paymentMode: "Cash on Delivery"
    }).save();

    const productList = products
      .map(p => `- ${p.name} (${p.qty < 1 ? p.qty * 1000 + " ग्राम" : p.qty + " किलो"})`)
      .join("\n");

    try {
      await resend.emails.send({
        from: `Ratu Fresh <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: "ck805026@gmail.com",
        subject: "🛒 नया ऑर्डर प्राप्त हुआ - Ratu Fresh",
        html: `
          <h2>नया ऑर्डर प्राप्त हुआ</h2>
          <p><strong>ग्राहक:</strong> ${customerName}</p>
          <p><strong>फोन:</strong> ${phone}</p>
          <p><strong>पता:</strong> ${address}</p>
          <hr />
          <h3>ऑर्डर विवरण:</h3>
          <pre>${productList}</pre>
          <hr />
          <p><strong>कुल कीमत:</strong> ₹${totalPrice}</p>
        `
      });
    } catch (emailErr) {
      console.error("❌ Order email error:", emailErr.message);
    }

    res.json({ message: "ऑर्डर सफल", orderId: order._id });
  } catch (err) {
    console.error("❌ Place order error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/subscribe", async (req, res) => {
  const { subscription, phone } = req.body;
  subscriptions.push({ subscription, phone });
  res.status(201).json({ success: true });
});

app.post("/send", async (req, res) => {
  const { phone, payload } = req.body;
  const targets = subscriptions.filter(s => s.phone === phone).map(s => s.subscription);
  const results = await Promise.all(
    targets.map(sub =>
      webpush.sendNotification(sub, JSON.stringify(payload))
        .then(() => ({ ok: true }))
        .catch(err => ({ ok: false, error: err.message }))
    )
  );
  res.json({ total: results.length, succeeded: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length });
});

app.post("/send-all", async (req, res) => {
  const { payload } = req.body;
  const results = await Promise.all(
    subscriptions.map(({ subscription }) =>
      webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => ({ ok: true }))
        .catch(err => ({ ok: false, error: err.message }))
    )
  );
  res.json({ total: results.length, succeeded: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length });
});

app.post("/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "Invalid coordinates" });
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const { data } = await axios.get(url, { headers: { "User-Agent": "RatuFresh/1.0" } });
    if (!data?.display_name) return res.status(404).json({ error: "Address not found" });
    res.json({ displayName: data.display_name, components: data.address || {} });
  } catch (err) {
    console.error("❌ Reverse geocode error:", err.message);
    res.status(500).json({ error: "Reverse geocoding failed" });
  }
});

app.post("/geocode", async (req, res) => {
  const { address, area, pincode } = req.body;
  const query = [address, area, pincode].filter(Boolean).join(", ");
  if (!query) return res.status(400).json({ error: "Address is required" });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: { "User-Agent": "RatuFresh/1.0" } });
    if (!Array.isArray(data) || !data.length) return res.status(404).json({ error: "Location not found" });
    const match = data[0];
    res.json({ lat: parseFloat(match.lat), lng: parseFloat(match.lon), displayName: match.display_name });
  } catch (err) {
    console.error("❌ Geocode error:", err.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ratufresh@2025';

app.get('/admin', (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD) return res.status(401).send('Unauthorized');
  res.sendFile(path.join(__dirname, 'secure', 'admin.html'));
});

mongoose
  .connect(process.env.DBurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT || 4000, () => console.log("🚀 Server running on port", process.env.PORT || 4000)))
  .catch(err => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  });
