let express = require("express");
var mongoose = require("mongoose");
const bodyParser = require('body-parser');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const cors = require("cors");
const { Login } = require("./models/schema");
require('dotenv').config();
let app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/signup", (req, res) => {
  let { phone,email, password } = req.body;
   if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

 let userlogin = new Login({
      phone: phone,
      email: email,
      password:password,
    })

  userlogin.save()
    .then(() => {
      console.log("Thanks for login");
      res.status(200).send("Thanks for login");
    })
    .catch((err) => {
      console.error("login failed:", err);
      res.status(500).send("login failed");
    });
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  // Phone number validation
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).send("Invalid phone number");
  }

  // Find user
  const user = await Login.findOne({ phone });
  if (!user) {
    return res.status(404).send("User not found");
  }

  // Check password (plain text match)
if (user.password !== password) {
  return res.status(401).send("Incorrect password");
}

// Password सही है — अब user data भेजो
res.status(200).json({
  
 
});

})
  app.post("/enquiry", (req, res) => {
    // let userid = req.params.id;
    let { name, email, phone, message } = req.body;
    let userpost = new User({
        name: name,
        email: email,
        phone: phone,
        message: message,
    })
    userpost.save()
        .then(() => {
            console.log("Thanks for enquiry");
            res.status(200).send("Enquiry saved");
        })
        .catch((err) => {
            console.error("Enquiry failed:", err);
            res.status(500).send("Error saving enquiry");
        });

});

// })
mongoose.connect(process.env.DBurl).then(() => {
    console.log("connected to mongoose");
    app.listen(process.env.port, () => {
        console.log("connect to port number" + process.env.port);

    });

})

