// 📦 Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// 📁 Models & Routes
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order"); // ✅ Import Order model
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
// 🌐 Route to serve main.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});
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

// 🛒 Cart routes
app.use("/cart", cartRoutes);

// 📝 Signup route
app.post("/signup", async (req, res) => {
  const { name, phone, email, password, address, pincode, area } = req.body;

  if (!name || !phone || !email || !password || !address || !pincode || !area) {
    return res.status(400).json({ error: "सभी फ़ील्ड आवश्यक हैं" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "User पहले से मौजूद है" });
    }

    const newUser = new User({ name, phone, email, password, address, pincode, area });
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

// 🔐 Login route with JWT
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone }).populate("cart");
    if (!user) return res.status(404).json({ error: "❌ User not found" });
    if (user.password !== password) return res.status(401).json({ error: "❌ Incorrect password" });

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "✅ Login successful",
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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// 🛒 Protected Place Order route
app.post("/place-order", authenticate, async (req, res) => {
  const { products, totalPrice, customerName, address, phone } = req.body;

  if (!products || !totalPrice || !customerName || !address || !phone) {
    return res.status(400).json({ error: "❌ सभी फ़ील्ड आवश्यक हैं" });
  }

  try {
    // ✅ Save order to MongoDB
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

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
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
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "✅ ऑर्डर सफलतापूर्वक लिया गया और ईमेल भेजा गया",
      orderId: newOrder._id
    });

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "❌ ऑर्डर सेव करने या ईमेल भेजने में समस्या हुई" });
  }
});

// 🧾 Get all orders for a user
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

// 🌐 MongoDB connection
mongoose.connect(process.env.DBurl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.port || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });

