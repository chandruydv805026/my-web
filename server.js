// 📦 Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 📩 Resend SDK
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// 📁 Models & Routes
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 🔐 JWT Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "❌ Token missing" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "❌ Invalid token" });
    req.user = decoded;
    next();
  });
};
const path = require("path");

// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// Default route → serve main.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

// 🛒 Cart routes
app.use("/cart", cartRoutes);

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

// 🔐 OTP Store (in-memory)
const otpStore = {}; // { phone: { otp, expires } }

// 📩 Login → Send OTP via Resend
app.post("/login", async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = { otp, expires: Date.now() + 2 * 60 * 1000 };

    const { error } = await resend.emails.send({
      from: "Ratu Fresh <noreply@ratufresh.in>",
      to: user.email,
      subject: "🔐 आपका OTP - Ratu Fresh",
      text: `आपका OTP है: ${otp}\nयह 2 मिनट तक मान्य रहेगा।`
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "❌ OTP भेजने में समस्या हुई" });
    }

    res.status(200).json({
      success: true,
      message: "✅ OTP भेज दिया गया",
      email: user.email
    });
  } catch (err) {
    console.error("Login OTP error:", err);
    res.status(500).json({ error: "❌ OTP जनरेट करने में समस्या हुई" });
  }
});

// 🔁 Resend OTP via Resend
app.post("/resend-otp", async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = { otp, expires: Date.now() + 2 * 60 * 1000 };

    const { error } = await resend.emails.send({
      from: "Ratu Fresh <noreply@ratufresh.in>",
      to: user.email,
      subject: "🔁 नया OTP - Ratu Fresh",
      text: `आपका नया OTP है: ${otp}\nयह 2 मिनट तक मान्य रहेगा।`
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "❌ OTP भेजने में समस्या हुई" });
    }

    res.status(200).json({ success: true, message: "✅ नया OTP भेज दिया गया" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// ✅ Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore[phone];

  try {
    const user = await User.findOne({ phone }).populate("cart");
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    if (record && record.otp == otp && Date.now() < record.expires) {
      delete otpStore[phone];

      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          pincode: user.pincode,
          area: user.area,
          createdAt: user.createdAt,
          cart: user.cart
        }
      });
    } else {
      res.status(401).json({ success: false, error: "❌ Invalid or expired OTP" });
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ error: "❌ Server error" });
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
      from: "Ratu Fresh <noreply@ratufresh.in>",
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

// 🌐 MongoDB Connection & Server Start
mongoose.connect(process.env.DBurl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB से कनेक्शन सफल");

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server चालू है: https://my-web-xrr5.onrender.com:${PORT}`);

  });
})
.catch(err => {
  console.error("❌ MongoDB से कनेक्शन फेल:", err);
});

