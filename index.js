let express = require("express");
var mongoose = require("mongoose");
const bodyParser = require('body-parser');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const cors = require("cors");
const { Login } = require("./models/schema"); // Only Login model used
require('dotenv').config();

let app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Root route for Render health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/signup", (req, res) => {
  let { phone, email, password } = req.body;
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  let userlogin = new Login({
    phone: phone,
    email: email,
    password: password,
  });

  userlogin.save()
    .then(() => {
      console.log("Thanks for signup");
      res.status(200).send("Thanks for signup");
    })
    .catch((err) => {
      console.error("Signup failed:", err);
      res.status(500).send("Signup failed");
    });
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  const user = await Login.findOne({ phone });
  if (!user) {
    return res.status(404).send("User not found");
  }

  if (user.password !== password) {
    return res.status(401).send("Incorrect password");
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      phone: user.phone,
      email: user.email
    }
  });
});

// ✅ Corrected PORT variable casing
mongoose.connect(process.env.DBurl).then(() => {
  console.log("Connected to mongoose");
  app.listen(process.env.PORT || 10000, () => {
    console.log("Connected to port number " + (process.env.PORT || 10000));
  });
});
