let express = require("express");
var mongoose = require("mongoose");
const bodyParser = require('body-parser');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const cors = require("cors");
const Login = require("./models/schema");
require('dotenv').config();
let app = express();
app.use(bodyParser.json());
app.use(cors());
const path = require("path");

// Serve static files
// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Catch-all fallback route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.post("/signup", (req, res) => {
  const { phone, email, password } = req.body;

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  const userlogin = new Login({ phone, email, password });

  userlogin.save()
    .then(() => {
      console.log("Thanks for login");
      res.status(200).json({ message: "Thanks for login" }); // ✅ JSON response
    })
    .catch((err) => {
      console.error("login failed:", err);
      res.status(500).json({ error: "login failed" }); // ✅ JSON response
    });
});


app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  // ✅ Validate phone number
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    // ✅ Find user by phone
    const user = await Login.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Check password (plain text match)
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // ✅ Success response (excluding password)
    res.status(200).json({
      message: "Login successful",
      user: {
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
  
mongoose.connect(process.env.DBurl).then(() => {
    console.log("connected to mongoose");
    app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Server running on port " + (process.env.PORT || 10000));
});

});






