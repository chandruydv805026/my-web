const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { Login } = require("./models/schema");
require("dotenv").config();

const app = express(); // ✅ app pehle define karo

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.post("/signup", (req, res) => {
  const { phone, email, password } = req.body;
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const userlogin = new Login({ phone, email, password });

  userlogin.save()
    .then(() => res.status(200).send("Thanks for signup"))
    .catch((err) => res.status(500).send("Signup failed"));
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const user = await Login.findOne({ phone });
  if (!user) return res.status(404).send("User not found");
  if (user.password !== password) return res.status(401).send("Incorrect password");

  res.status(200).json({
    message: "Login successful",
    user: {
      phone: user.phone,
      email: user.email
    }
  });
});

mongoose.connect(process.env.DBurl).then(() => {
  console.log("Connected to mongoose");
  app.listen(process.env.PORT || 10000, () => {
    console.log("Connected to port number " + (process.env.PORT || 10000));
  });
});
