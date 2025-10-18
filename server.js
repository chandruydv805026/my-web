const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const User = require("./models/schema"); // ✅ Correct model import
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// ✅ Signup route
app.post("/signup", async (req, res) => {
  const { phone, email, password } = req.body;

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    const user = new User({ phone, email, password });
    await user.save();
    console.log("✅ User signed up:", user.phone);
    res.status(200).json({ message: "Signup successful" });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: err.message || "Signup failed" });
  }
});

// ✅ Login route
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fallback route only for GET requests
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.sendFile(path.join(__dirname, "public", "main.html"));
  } else {
    next();
  }
});

// ✅ MongoDB connection and server start
mongoose
  .connect(process.env.DBurl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("✅ Server running on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

