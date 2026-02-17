const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const path = require("path");
const multer = require("multer"); 
require("dotenv").config();

// Models
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const Product = require("./models/product"); 
const Banner = require("./models/banner"); // नया: बैनर मॉडल

const app = express();
app.use(express.json());

// Professional CORS Setup
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Static Files Setup
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Default Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "main.html"));
});

// CONFIGURATION
const SHOP_LAT = 23.414336; 
const SHOP_LNG = 85.216316;
const MAX_DISTANCE_KM = 5;
const ADMIN_EMAIL = "ck805026@gmail.com"; 
const ADMIN_PASSWORD_SECRET = "admin786"; 

// [UPDATE] यहाँ .trim() लगाया गया है ताकि .env के फालतू स्पेस हट जाएँ
const ONESIGNAL_APP_ID = (process.env.ONESIGNAL_APP_ID || "").trim();
const ONESIGNAL_REST_KEY = (process.env.ONESIGNAL_REST_KEY || "").trim();

// Middleware for JWT Authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access Denied. Login Required." });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) { res.status(403).json({ error: "Invalid Token" }); }
};

// Distance Calculation
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Nodemailer Transporter (UPDATED FOR RENDER STABILITY)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
    }
});

const signupTempStore = {};
const loginOtpStore = {};

// --- 1. PRODUCT ROUTES ---

app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); }
});

app.post("/api/products/add", upload.single('image'), async (req, res) => {
    const { name, price, unit, inStock, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized: Wrong Admin Password" });
    }
    try {
        const productId = name.toLowerCase().split(' ').join('-');
        const newProduct = new Product({
            id: productId,
            name: name,
            price: price,
            unit: unit || 'kg',
            inStock: inStock === 'true',
            img: `/uploads/${req.file.filename}` 
        });
        await newProduct.save();
        res.json({ success: true, message: "Product Added Successfully" });
    } catch (err) { 
        res.status(500).json({ error: "Failed to add product" }); 
    }
});

app.put("/api/products/update/:id", async (req, res) => {
    const { name, price, img, password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized: Wrong Admin Password" });
    }
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id }, 
            { name, price: Number(price), img },
            { new: true }
        );
        res.json({ success: true, product: updatedProduct });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.delete("/api/products/delete/:id", async (req, res) => {
    const { password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized: Wrong Admin Password" });
    }
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.json({ success: true, message: "Product Deleted Successfully" });
    } catch (err) { 
        res.status(500).json({ error: "Delete failed" }); 
    }
});

// --- नया: BANNER ROUTES ---

app.post("/api/banners/add", upload.single('image'), async (req, res) => {
    const { title, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const newBanner = new Banner({
            title: title,
            img: `/uploads/${req.file.filename}`
        });
        await newBanner.save();
        res.json({ success: true, message: "Banner Added Successfully" });
    } catch (err) { res.status(500).json({ error: "Banner upload failed" }); }
});

app.get("/api/banners", async (req, res) => {
    try {
        const banners = await Banner.find({ active: true });
        res.json(banners);
    } catch (err) { res.status(500).json({ error: "Failed to fetch banners" }); }
});

app.delete("/api/banners/delete/:id", async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Banner Deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- 2. GEOLOCATION ROUTE (FIXED FOR 500/502 ERROR) ---
app.post("/reverse-geocode", async (req, res) => {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: "Coordinates missing" });
    
    const distance = getDistance(SHOP_LAT, SHOP_LNG, lat, lng);
    if (distance > MAX_DISTANCE_KM) {
        return res.status(400).json({ error: `Out of area. We deliver within 5km.` });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const { data } = await axios.get(url, { 
            headers: { "User-Agent": "RatuFreshApp/1.0 (ck805026@gmail.com)" },
            timeout: 10000 
        });
        
        if (data && data.address) {
            res.json({ 
                displayName: data.display_name, 
                pincode: data.address.postcode || '', 
                area: data.address.suburb || data.address.neighbourhood || data.address.city || 'Local Area'
            });
        } else {
            res.status(404).json({ error: "Address not found" });
        }
    } catch (err) { 
        console.error("Geocode Error:", err.message);
        res.status(500).json({ error: "Location service error. Please try again." }); 
    }
});

// --- 3. AUTH ROUTES ---

app.post("/send-signup-otp", async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) return res.status(400).json({ error: "Email or Phone already registered." });
        
        const otp = Math.floor(100000 + Math.random() * 900000);
        signupTempStore[email] = { userData: req.body, otp, expires: Date.now() + 300000 };
        
        await transporter.sendMail({
            from: `"Ratu Fresh" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Signup - Ratu Fresh",
            text: `Welcome ${name}! Your OTP is: ${otp}`
        });
        
        const [userPart, domain] = email.split("@");
        const maskedEmail = userPart.substring(0, 2) + "******" + userPart.slice(-2) + "@" + domain;
        res.json({ success: true, message: "OTP Sent", maskedEmail });
    } catch (err) { 
        console.error("OTP Error:", err.message);
        res.status(500).json({ error: "Signup OTP error. Check Email settings." }); 
    }
});

app.post("/verify-signup", async (req, res) => {
    const { email, otp } = req.body;
    const record = signupTempStore[email];
    if (record?.otp == otp && Date.now() < record.expires) {
        try {
            const newUser = new User(record.userData);
            const savedUser = await newUser.save();
            await new Cart({ user: savedUser._id, items: [] }).save();
            delete signupTempStore[email];
            const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
            res.json({ success: true, token, user: savedUser });
        } catch (err) { res.status(500).json({ error: "Save user failed" }); }
    } else { res.status(401).json({ error: "Invalid OTP" }); }
});

app.post("/login", async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ error: "User not found" });
        const otp = Math.floor(100000 + Math.random() * 900000);
        loginOtpStore[phone] = { otp, expires: Date.now() + 300000 };
        await transporter.sendMail({
            from: `"Ratu Fresh" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Login OTP - Ratu Fresh",
            text: `Your Login OTP is: ${otp}`
        });
        const [userPart, domain] = user.email.split("@");
        const maskedEmail = userPart.substring(0, 2) + "******" + userPart.slice(-2) + "@" + domain;
        res.json({ success: true, maskedEmail });
    } catch (err) { res.status(500).json({ error: "Mail error" }); }
});

app.post("/verify-login", async (req, res) => {
    const { phone, otp } = req.body;
    const record = loginOtpStore[phone];
    if (record?.otp == otp && Date.now() < record.expires) {
        const user = await User.findOne({ phone });
        delete loginOtpStore[phone];
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
        return res.json({ success: true, token, user });
    }
    res.status(401).json({ error: "Invalid OTP" });
});

// --- 4. CART & ORDER ROUTES ---
app.get("/cart/get", authenticate, async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user.userId });
        res.json(userCart || { items: [], totalPrice: 0 });
    } catch (err) { res.status(500).json({ error: "Cart fetch failed" }); }
});

app.post("/cart/sync", authenticate, async (req, res) => {
    try {
        const { item } = req.body; 
        const userId = req.user.userId;
        
        const dbProduct = await Product.findOne({ id: item.productId });
        if (dbProduct) {
            item.price = dbProduct.price;
            item.subtotal = dbProduct.price * item.quantity;
        }

        let userCart = await Cart.findOne({ user: userId });
        if (!userCart) {
            userCart = new Cart({ user: userId, items: [item], totalPrice: item.subtotal });
        } else {
            const itemIndex = userCart.items.findIndex(p => p.productId === item.productId);
            if (itemIndex > -1) {
                userCart.items[itemIndex].quantity = item.quantity;
                userCart.items[itemIndex].price = item.price;
                userCart.items[itemIndex].subtotal = item.subtotal;
            } else {
                userCart.items.push(item);
            }
            userCart.totalPrice = userCart.items.reduce((acc, curr) => acc + curr.subtotal, 0);
        }
        await userCart.save();
        res.json({ success: true, cart: userCart });
    } catch (err) { res.status(500).json({ error: "Cart sync failed" }); }
});

app.delete("/cart/remove/:productId", authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        let userCart = await Cart.findOne({ user: userId });
        if (userCart) {
            userCart.items = userCart.items.filter(i => i.productId !== req.params.productId);
            userCart.totalPrice = userCart.items.reduce((acc, curr) => acc + curr.subtotal, 0);
            await userCart.save();
            res.json({ success: true, cart: userCart });
        } else { res.status(404).json({ error: "Cart not found" }); }
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

app.get("/orders/my-orders", authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: "Fetch orders failed" }); }
});

app.post("/orders/place", authenticate, async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user.userId });
        const user = await User.findById(req.user.userId);
        if (!userCart || userCart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

        const newOrder = new Order({
            userId: req.user.userId,
            phone: user.phone,
            items: userCart.items,
            totalAmount: userCart.totalPrice,
            deliveryAddress: req.body.address,
            lat: user.lat,
            lng: user.lng,
            status: "Pending",
            orderDate: new Date() 
        });

        const savedOrder = await newOrder.save();
        
        const mapsLink = user.lat && user.lng ? `https://www.google.com/maps?q=${user.lat},${user.lng}` : "Location not detected";

        await transporter.sendMail({
            from: `"Admin Order" <${process.env.SMTP_USER}>`,
            to: ADMIN_EMAIL,
            subject: `New Order! - #${savedOrder._id.toString().substring(0,8)}`,
            text: `Customer: ${user.name}\nAddress: ${req.body.address}\n📍 Maps Link: ${mapsLink}\nTotal: ₹${userCart.totalPrice}`
        });

        await Cart.findOneAndUpdate({ user: req.user.userId }, { items: [], totalPrice: 0 });
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: "Order failed" }); }
});

app.post("/orders/cancel/:orderId", authenticate, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { _id: req.params.orderId, userId: req.user.userId, status: "Pending" },
            { status: "Cancelled" },
            { new: true }
        );
        if(!order) return res.status(400).json({ error: "Cannot cancel" });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Cancel failed" }); }
});

// --- 5. NOTIFICATION & PROFILE ---

app.post("/admin/send-broadcast", authenticate, async (req, res) => {
    const { title, message } = req.body;
    try {
        await axios.post("https://onesignal.com/api/v1/notifications", {
            app_id: ONESIGNAL_APP_ID,
            included_segments: ["Total Subscriptions"], 
            headings: { "en": title },
            contents: { "en": message },
        }, {
            headers: { 
                "Content-Type": "application/json; charset=utf-8", 
                "Authorization": `Basic ${ONESIGNAL_REST_KEY}` 
            }
        });
        res.json({ success: true });
    } catch (err) { 
        console.error("OneSignal Error Details:", err.response?.data || err.message);
        res.status(500).json({ error: "Notification failed", details: err.response?.data }); 
    }
});

app.put("/user/update", authenticate, async (req, res) => {
    try {
        const { name, phone, address, area, lat, lng } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.user.userId, { name, phone, address, area, lat, lng }, { new: true });
        res.json({ success: true, user: updatedUser });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// DATABASE CONNECTION & AUTO-FILL
mongoose.connect(process.env.DBurl)
    .then(async () => {
        console.log("🚀 MongoDB Connected");

        try {
            await mongoose.connection.db.collection('orders').createIndex(
                { "orderDate": 1 }, 
                { expireAfterSeconds: 7200 }
            );
            console.log("🕒 Auto-Delete Activated: Orders will vanish after 2 hours.");
        } catch (e) { console.log("Index already exists or error."); }
        
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                { id: 'aloo', name: 'Potato (Aloo)', price: 20, img: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg', unit: 'kg' },
                { id: 'tomato', name: 'Tomato (Tamatar)', price: 30, img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg', unit: 'kg' },
                { id: 'onion', name: 'Onion (Pyaz)', price: 25, img: 'https://media.istockphoto.com/id/1181631588/photo/onions-for-sale-in-the-weekly-market-malkapur-maharashtra.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzL0b1DNEWUehYWVqYzY9qE-ZK88KJgO6eY-etuQYoc=', unit: 'kg' },
                { id: 'bhindi', name: 'Lady Finger (Bhindi)', price: 35, img: 'https://media.istockphoto.com/id/1503362390/photo/okra-over-wooden-table-background-cut-okra-and-whole-ladys-finger.jpg?s=1024x1024&w=is&k=20&c=xYk1xHhyPEMiZzYxaBu5IMyqXK3qdrlCVVFh8Yy4GgM=', unit: 'kg' },
                { id: 'lauki', name: 'Bottle Gourd (Lauki)', price: 18, img: 'https://media.istockphoto.com/id/1194258667/photo/bottle-gourd-for-sale-in-market.jpg?s=1024x1024&w=is&k=20&c=rmDr-KGaiUEaxCqaEQ6e_MakDj6klaXYE-StTySjPUM=', unit: 'kg' },
                { id: 'karela', name: 'Bitter Gourd (Karela)', price: 28, img: 'https://media.istockphoto.com/id/472402096/photo/top-view-of-green-bitter-gourds-in-the-basket.jpg?s=612x612&w=0&k=20&c=n7Ua0o7X4Qe_FSfl38ufHIPslxofgkyNpa2Z2NXmBfM=', unit: 'kg' },
                { id: 'gajar', name: 'Carrot (Gajar)', price: 22, img: 'https://images.unsplash.com/photo-1633380110125-f6e685676160?auto=format&fit=crop&w=600', unit: 'kg' },
                { id: 'mooli', name: 'Radish (Mooli)', price: 15, img: 'https://media.istockphoto.com/id/903099876/photo/fresh-vegetable-for-sale-on-market-in-india.webp?a=1&b=1&s=612x612&w=0&k=20&c=9oElMWTKZOzIny5ND9MESWmEgG-ONAINWzQL8tSrF04=', unit: 'kg' },
                { id: 'baingan', name: 'Brinjal (Baingan)', price: 26, img: 'https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?auto=format&fit=crop&q=60&w=600', unit: 'kg' },
                { id: 'shimla', name: 'Capsicum (Shimla Mirch)', price: 40, img: 'https://media.istockphoto.com/id/137350104/photo/green-peppers.webp?a=1&b=1&s=612x612&w=0&k=20&c=7u2DZpZoSZIWkSDyvAbxkvNU09BrvPdQCPzM4LcsxvU=', unit: 'kg' },
                { id: 'palak', name: 'Spinach (Palak)', price: 20, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600', unit: 'kg' },
                { id: 'phool', name: 'Cauliflower (Phool Gobhi)', price: 30, img: 'https://media.istockphoto.com/id/1372304664/photo/group-of-cauliflower-fresh-cauliflower-for-sale-at-a-market.webp?a=1&b=1&s=612x612&w=0&k=20&c=lEwN90TtHLVx-r3U9GRyRKmXKzfW4tdeUWRWAcOCX7k=', unit: 'kg' },
                { id: 'lemon', name: 'Lemon (Nimbu)', price: 10, img: 'https://media.istockphoto.com/id/871706470/photo/group-of-fresh-lemon-on-an-old-vintage-wooden-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=y-meMhMc9CK-Mtz8vM6JRaIOEeiXPcnbdsGca-KCogM=', unit: 'pc' },
                { id: 'lahsoon', name: 'Garlic (Lahsoon)', price: 21, img: 'https://media.istockphoto.com/id/531644839/photo/garlic.webp?a=1&b=1&s=612x612&w=0&k=20&c=kABuNBJXIiwWun2GETzq_Gn_u3M9MlxgTfBFLOZYrnU=', unit: 'kg' },
                { id: 'mirch', name: 'Green Chilli (Hari Mirch)', price: 45, img: 'https://media.istockphoto.com/id/942849220/photo/ripe-green-chilli-pepper.webp?a=1&b=1&s=612x612&w=0&k=20&c=qsUq5pSQ7j7T4O8UMEUiSgdSSt5DlKybwc7QS_o9Oao=', unit: 'kg' },
                { id: 'chana', name: 'Green Chickpeas (Hara Chana)', price: 32, img: 'https://media.istockphoto.com/id/899854420/photo/fresh-green-chickpeas-or-chick-peas-also-known-as-harbara-or-harbhara-in-hindi-and-cicer-is.webp?a=1&b=1&s=612x612&w=0&k=20&c=B_zR-xU5c5WDsJTvZKJAq2MkTJwJ--autmPGFPPoQ3w=', unit: 'kg' }
            ];
            await Product.insertMany(initialProducts);
            console.log("✅ 16 Initial Products Seeded Successfully");
        }
        
        // Render के लिए 10000 पोर्ट इस्तेमाल करना सबसे सही रहता है
        const PORT = process.env.PORT || 10000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error("DB error:", err));
