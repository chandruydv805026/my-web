// 📦 Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

// 📩 Resend SDK
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

    res.status(201).json({ message: "Signup सफल", userId: newUser._id });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🌐 Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});
app.get("/user/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("cart");
    if (!user) return res.status(404).json({ success: false, message: "User नहीं मिला" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "❌ Server error" });
  }
});

// 🛒 Cart routes
app.use("/cart", cartRoutes);

// 🔐 OTP Store (in-memory)
const otpStore = {}; // { phone: { otp, expires } }

// 📝 Signup route
app.post("/signup", async (req, res) => {
  const { name, phone, email, address, pincode, area } = req.body;

  if (!name || !phone || !email || !address || !pincode || !area) {
    return res.status(400).json({ error: "सभी फ़ील्ड आवश्यक हैं" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "User पहले से मौजूद है" });
    }

    const newUser = new User({ name, phone, email, address, pincode, area });
    await newUser.save();

    const newCart = new Cart({ user: newUser._id, items: [], totalPrice: 0 });
    await newCart.save();

    newUser.cart = newCart._id;
    await newUser.save();

    res.status(201).json({ message: "✅ Signup सफल हुआ", userId: newUser._id });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

// 📩 Login → Send OTP
app.post("/login", async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    if (!user.email || !user.email.includes("@")) {
      return res.status(400).json({ error: "❌ Invalid email address" });
    }

    console.log("📩 Sending OTP to:", user.email);

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = { otp, expires: Date.now() + 2 * 60 * 1000 };

    try {
      const response = await resend.emails.send({
        from: "Ratu Fresh <onboarding@resend.dev>",
        to: user.email,
        subject: "🔐 आपका OTP - Ratu Fresh",
        text: `आपका OTP है: ${otp}\nयह 2 मिनट तक मान्य रहेगा।`
      });

      if (response.error) {
        console.error("📨 Resend error:", response.error);
        return res.status(500).json({ error: "❌ OTP भेजने में समस्या हुई" });
      }

      res.status(200).json({
        success: true,
        message: "✅ OTP भेज दिया गया",
        email: user.email
      });
    } catch (emailErr) {
      console.error("📨 Email send failed:", emailErr);
      return res.status(500).json({ error: "❌ Email भेजने में समस्या हुई" });
    }

  } catch (err) {
    console.error("Login OTP error:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
});
// 🔁 Resend OTP
app.post("/resend-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    if (!user.email || !user.email.includes("@")) {
      return res.status(400).json({ error: "❌ Invalid email address" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = { otp, expires: Date.now() + 2 * 60 * 1000 };

    try {
      const response = await resend.emails.send({
        from: "Ratu Fresh <onboarding@resend.dev>",
        to: user.email,
        subject: "🔁 नया OTP - Ratu Fresh",
        text: `आपका नया OTP है: ${otp}\nयह 2 मिनट तक मान्य रहेगा।`
      });

      if (response.error) {
        console.error("📨 Resend error:", response.error);
        return res.status(500).json({ error: "❌ OTP भेजने में समस्या हुई" });
      }

      res.status(200).json({ success: true, message: "✅ नया OTP भेज दिया गया" });
    } catch (emailErr) {
      console.error("📨 Email send failed:", emailErr);
      return res.status(500).json({ error: "❌ Email भेजने में समस्या हुई" });
    }

  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ Verify OTPapp.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = otpStore[phone];
    const user = await User.findOne({ phone }).populate("cart");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (record?.otp == otp && Date.now() < record.expires) {
      delete otpStore[phone];
      const token = jwt.sign({ userId: user._id, phone }, process.env.JWT_SECRET, { expiresIn: "2h" });
      return res.json({ success: true, token,user: { _id: user._id, name: user.name, phone: user.phone, email: user.email, address: user.address, pincode: user.pincode, area: user.area, createdAt: user.createdAt, cart: user.cart }  });
    }
    res.status(401).json({ success: false, error: "OTP गलत या समाप्त हो गया" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




// 🛒 Place Order
app.post("/place-order", authenticate, async (req, res) => {
  const { products, totalPrice, customerName, address, phone } = req.body;

  if (!products || !totalPrice || !customerName || !address || !phone) {
    return res.status(400).json({ error: "❌ सभी फ़ील्ड आवश्यक हैं" });
  }

  try {
    const newOrder = new Order({
      userId: req.user.userId,
      items: products.map(p => ({
        productId: p.productId || p.name,
        name: p.name,
        quantity: p.qty,
        price: p.price || 0
      })),
      totalAmount: totalPrice,
      deliveryAddress: address,
      phone: phone,
      paymentMode: "Cash on Delivery"
    });

    await newOrder.save();

    await resend.emails.send({
      from: "Ratu Fresh <onboarding@resend.dev>",
      to: "ck805026@gmail.com",
      subject: "🛒 नया ऑर्डर प्राप्त हुआ - Ratu Fresh",
      text: `
नया ऑर्डर प्राप्त हुआ!

ग्राहक: ${customerName}
फोन: ${phone}
पता: ${address}

उत्पाद:
${products.map(p => `- ${p.name} (${p.qty}kg)`).join("\n")}

कुल कीमत: ₹${totalPrice}
      `
    });

    res.status(200).json({
      message: "✅ ऑर्डर सफलतापूर्वक लिया गया और ईमेल भेजा गया",
      orderId: newOrder._id
    });

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "❌ ऑर्डर सेव करने या ईमेल भेजने में समस्या हुई" });
  }
});

// 📦 Get Orders
// 📦 Get Orders
app.get("/orders/:userId", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ orderDate: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "कोई ऑर्डर नहीं मिला" });
    }

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "❌ ऑर्डर लोड करने में समस्या हुई" });
  }
});
// 🧾 ✅ Profile Update API
app.put("/user/update", authenticate, async (req, res) => {
  const { _id, name, email, phone, address, pincode, area } = req.body;

  if (!_id || ![name, email, phone, address, pincode, area].every(Boolean)) {
    return res.status(400).json({ success: false, message: "सभी फ़ील्ड आवश्यक हैं" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { name, email, phone, address, pincode, area },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User नहीं मिला" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update में समस्या है", error: err.message });
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
    console.error("Reverse geocode error:", err.message);
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
    console.error("Geocode error:", err.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ratufresh@2025';

app.get('/admin', (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD) return res.status(401).send('Unauthorized');
  res.sendFile(path.join(__dirname, 'secure', 'admin.html'));
});
// 🌐 MongoDB Connection & Server Start
mongoose.connect(process.env.DBurl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB से कनेक्शन सफल");

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
   });
})
.catch(err => {
  console.error("❌ MongoDB से कनेक्शन फेल:", err);
});









