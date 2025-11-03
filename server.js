const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/schema");
const Cart = require("./models/cart");
const cartRoutes = require("./routes/cartRoutes");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.json());
app.use(cors());
const path = require("path");

// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// Default route to serve main.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

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

// 🔐 Login route
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone }).populate("cart");
    if (!user) return res.status(404).json({ error: "❌ User not found" });
    if (user.password !== password) return res.status(401).json({ error: "❌ Incorrect password" });

    res.status(200).json({
      message: "✅ Login successful",
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
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/place-order", async (req, res) => {
  const { products, totalPrice, customerName, address, phone } = req.body;

  const emailText = `
🛒 नया ऑर्डर प्राप्त हुआ!

ग्राहक: ${customerName}
फोन: ${phone}
पता: ${address}

उत्पाद:
${products.map(p => `- ${p.name} (${p.qty}kg)`).join("\n")}

कुल कीमत: ₹${totalPrice}
  `;

  try {
    await resend.emails.send({
      from: 'Ratu Fresh <onboarding@resend.dev>',
      to: 'ck805026@gmail.com',
      subject: '🛒 नया ऑर्डर प्राप्त हुआ - Ratu Fresh',
      text: emailText
    });

    res.status(200).json({ message: "✅ ऑर्डर लिया गया और ईमेल भेजा गया (Resend API)" });
  } catch (err) {
    console.error("Resend API error:", err);
    res.status(500).json({ error: "❌ ईमेल भेजने में समस्या हुई (Resend API)" });
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




