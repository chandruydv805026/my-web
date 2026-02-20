const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const path = require("path");
const multer = require("multer"); 
const crypto = require("crypto"); 
const { Resend } = require("resend"); 
require("dotenv").config();

// Models - Ensure these paths are correct in your project
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const Product = require("./models/product"); 
const Banner = require("./models/banner");

const app = express();
app.use(express.json());

// Resend Initialize for Emailing
const resend = new Resend(process.env.RESEND_API_KEY);

// Professional CORS Setup for Production
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Static Files Setup
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- MULTER CONFIGURATION FOR IMAGE UPLOADS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- DEFAULT ROUTES ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// --- CONFIGURATION CONSTANTS ---
const SHOP_LAT = 23.414336; 
const SHOP_LNG = 85.216316;
const MAX_DISTANCE_KM = 5;
const ADMIN_EMAIL = "ck805026@gmail.com"; 
const ADMIN_PASSWORD_SECRET = process.env.ADMIN_PASSWORD;

const ONESIGNAL_APP_ID = (process.env.ONESIGNAL_APP_ID || "").trim();
const ONESIGNAL_REST_KEY = (process.env.ONESIGNAL_REST_KEY || "").trim();

// --- MIDDLEWARE FOR AUTHENTICATION ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. Login Required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
};

// --- GEOLOCATION DISTANCE CALCULATION ---
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

const loginOtpStore = {};

// --- 1. PRODUCT MANAGEMENT ROUTES ---

app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.post("/api/products/add", upload.single('image'), async (req, res) => {
    const { name, price, unit, inStock, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized: Access Denied" });
    }
    try {
        const productId = name.toLowerCase().split(' ').join('-');
        const newProduct = new Product({
            id: productId,
            name: name,
            price: Number(price),
            unit: unit || 'kg',
            inStock: inStock === 'true',
            img: `/uploads/${req.file.filename}` 
        });
        await newProduct.save();
        res.json({ success: true, message: "Product Added" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

app.put("/api/products/update/:id", async (req, res) => {
    const { name, price, img, password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id }, 
            { name, price: Number(price), img },
            { new: true }
        );
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.delete("/api/products/delete/:id", async (req, res) => {
    const { password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.json({ success: true, message: "Product Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- 2. BANNER MANAGEMENT ROUTES ---

app.post("/api/banners/add", upload.single('image'), async (req, res) => {
    const { title, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        const newBanner = new Banner({
            title: title,
            img: `/uploads/${req.file.filename}`,
            active: true
        });
        await newBanner.save();
        res.json({ success: true, message: "Banner Added" });
    } catch (err) {
        res.status(500).json({ error: "Banner upload failed" });
    }
});

app.get("/api/banners", async (req, res) => {
    try {
        const banners = await Banner.find({ active: true });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch banners" });
    }
});

app.delete("/api/banners/delete/:id", async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Banner Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- 3. GEOLOCATION AND REVERSE GEOCODING ---
app.post("/reverse-geocode", async (req, res) => {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
        return res.status(400).json({ error: "Coordinates missing" });
    }

    const dist = getDistance(SHOP_LAT, SHOP_LNG, lat, lng);
    if (dist > MAX_DISTANCE_KM) {
        return res.status(400).json({ error: `Out of area. We deliver within 5km only.` });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const response = await axios.get(url, { 
            headers: { "User-Agent": "RatuFreshApp/1.1" },
            timeout: 10000 
        });
        
        const data = response.data;
        if (data && data.address) {
            res.json({ 
                displayName: data.display_name, 
                pincode: data.address.postcode || '', 
                area: data.address.suburb || data.address.neighbourhood || data.address.city || 'Local Area'
            });
        } else {
            res.status(404).json({ error: "Address details not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Location provider service error" });
    }
});

// --- 4. ADVANCED AUTHENTICATION (MAGIC LINK & OTP) ---

app.post("/api/signup/magic-link", async (req, res) => {
    const { name, email, phone, address, pincode, area, lat, lng } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email or Phone already exists." });
        }

        const mToken = crypto.randomBytes(32).toString("hex");
        const newUser = new User({
            name, email, phone, address, pincode, area, lat, lng,
            verificationToken: mToken,
            tokenExpiry: Date.now() + 3600000 // Valid for 1 Hour
        });

        await newUser.save();

        // https://www.merriam-webster.com/dictionary/fix Use your render URL or custom domain
        const verifyUrl = `https://my-web-xrr5.onrender.com/api/verify-email?token=${mToken}`;
        
        await resend.emails.send({
            from: 'Ratu Fresh <otp@ratufresh.me>',
            to: email,
            subject: `Verify Your Ratu Fresh Account, ${name}! 🥦`,
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 2px solid #24b637; border-radius: 15px;">
                    <h2 style="color: #24b637;">Welcome to Ratu Fresh!</h2>
                    <p>नमस्ते <b>${name}</b>, अकाउंट वेरीफाई करने के लिए नीचे बटन दबाएं:</p>
                    <a href="${verifyUrl}" style="background: #24b637; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold; margin-top: 15px;">Verify My Account ✨</a>
                </div>`
        });

        res.json({ success: true, message: "Magic Link sent to Gmail" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed on server" });
    }
});

app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ 
            verificationToken: token, 
            tokenExpiry: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).send("Link invalid or expired.");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        if (!(await Cart.findOne({ user: user._id }))) {
            await new Cart({ user: user._id, items: [] }).save();
        }

        const loginToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
        res.redirect(`/profiles.html?token=${loginToken}&verified=true`);
    } catch (err) {
        res.status(500).send("Verification processing error");
    }
});

app.post("/login", async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ error: "Phone number not registered" });
        }
        
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        loginOtpStore[phone] = { otp: otpCode, expires: Date.now() + 300000 };

        await resend.emails.send({
            from: 'Ratu Fresh <otp@ratufresh.me>',
            to: user.email,
            subject: `Login OTP: ${otpCode}`,
            html: `<div style="text-align:center;"><h2>Login OTP</h2><h1>${otpCode}</h1></div>`
        });

        const [u, d] = user.email.split("@");
        const masked = u.substring(0, 2) + "******" + u.slice(-2) + "@" + d;
        res.json({ success: true, message: "OTP Sent", maskedEmail: masked });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

app.post("/verify-login", async (req, res) => {
    const { phone, otp } = req.body;
    const record = loginOtpStore[phone];
    if (record && record.otp == otp && Date.now() < record.expires) {
        const user = await User.findOne({ phone });
        delete loginOtpStore[phone];
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
        return res.json({ success: true, token, user });
    }
    res.status(401).json({ error: "Invalid or Expired OTP" });
});

// --- 5. CART OPERATIONS ---
app.get("/cart/get", authenticate, async (req, res) => {
    try {
        let userCart = await Cart.findOne({ user: req.user.userId });
        if (userCart && userCart.items.length > 0) {
            let updatedTotal = 0;
            let isChanged = false;
            for (let item of userCart.items) {
                const dbP = await Product.findOne({ id: item.productId });
                if (dbP && item.price !== dbP.price) {
                    item.price = dbP.price;
                    item.subtotal = dbP.price * item.quantity;
                    isChanged = true;
                }
                updatedTotal += (item.price * item.quantity);
            }
            if (isChanged) {
                userCart.totalPrice = updatedTotal;
                await userCart.save();
            }
        }
        res.json(userCart || { items: [], totalPrice: 0 });
    } catch (err) {
        res.status(500).json({ error: "Cart fetch failed" });
    }
});

app.post("/cart/sync", authenticate, async (req, res) => {
    try {
        const { item } = req.body;
        const dbProduct = await Product.findOne({ id: item.productId });
        if (dbProduct) {
            item.price = dbProduct.price;
            item.subtotal = dbProduct.price * item.quantity;
        }
        let userCart = await Cart.findOne({ user: req.user.userId });
        if (!userCart) {
            userCart = new Cart({ user: req.user.userId, items: [item], totalPrice: item.subtotal });
        } else {
            const idx = userCart.items.findIndex(p => p.productId === item.productId);
            if (idx > -1) {
                userCart.items[idx].quantity = item.quantity;
                userCart.items[idx].price = item.price;
                userCart.items[idx].subtotal = item.subtotal;
            } else {
                userCart.items.push(item);
            }
            userCart.totalPrice = userCart.items.reduce((acc, curr) => acc + curr.subtotal, 0);
        }
        await userCart.save();
        res.json({ success: true, cart: userCart });
    } catch (err) {
        res.status(500).json({ error: "Sync failed" });
    }
});

app.delete("/cart/remove/:productId", authenticate, async (req, res) => {
    try {
        let userCart = await Cart.findOne({ user: req.user.userId });
        if (userCart) {
            userCart.items = userCart.items.filter(i => i.productId !== req.params.productId);
            userCart.totalPrice = userCart.items.reduce((acc, curr) => acc + curr.subtotal, 0);
            await userCart.save();
            res.json({ success: true, cart: userCart });
        } else {
            res.status(404).json({ error: "Cart not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- 6. ORDER MANAGEMENT ---

app.get("/orders/my-orders", authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Fetch orders failed" });
    }
});

app.post("/orders/place", authenticate, async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user.userId });
        const user = await User.findById(req.user.userId);
        
        if (!userCart || userCart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty" });
        }

        // [CLEANING DATA TO MATCH SCHEMA] 
        // Order Schema requires: productId, name, quantity, price
        const orderItems = userCart.items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        const newOrder = new Order({
            userId: req.user.userId,
            phone: user.phone,
            items: orderItems,
            totalAmount: userCart.totalPrice,
            deliveryAddress: req.body.address || user.address,
            status: "Pending",
            orderDate: new Date()
        });

        const savedOrder = await newOrder.save();

        // Admin Email Alert
        await resend.emails.send({
            from: 'Ratu Fresh Admin <otp@ratufresh.me>',
            to: ADMIN_EMAIL,
            subject: `New Order! - #${savedOrder._id.toString().substring(0,8)}`,
            text: `Customer: ${user.name}\nAddress: ${req.body.address}\nTotal: ₹${userCart.totalPrice}\nPhone: ${user.phone}`
        });

        // Clear Cart after success
        await Cart.findOneAndUpdate({ user: req.user.userId }, { items: [], totalPrice: 0 });
        res.status(201).json({ success: true, message: "Order Success" });

    } catch (err) {
        console.error("Order Save Error:", err);
        res.status(500).json({ error: "Internal Database Error" });
    }
});

app.post("/orders/cancel/:orderId", authenticate, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { _id: req.params.orderId, userId: req.user.userId, status: "Pending" },
            { status: "Cancelled" },
            { new: true }
        );
        if (!order) {
            return res.status(400).json({ error: "Order cannot be cancelled or not found." });
        }
        await resend.emails.send({
            from: 'Ratu Fresh <otp@ratufresh.me>',
            to: ADMIN_EMAIL,
            subject: `Order Cancelled`,
            text: `Customer has cancelled order #${order._id}`
        });
        res.json({ success: true, message: "Cancelled" });
    } catch (err) {
        res.status(500).json({ error: "Cancellation failed" });
    }
});

// --- 7. ADMIN TOOLS & NOTIFICATIONS ---

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
        res.status(500).json({ error: "Notification failed" });
    }
});

app.put("/user/update", authenticate, async (req, res) => {
    try {
        const { name, phone, address, area, lat, lng } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId, 
            { name, phone, address, area, lat, lng }, 
            { new: true }
        );
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.post("/api/admin/verify", (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Invalid Admin Key" });
    }
});

app.get("/ping", (req, res) => {
    res.status(200).send("I am alive and well!");
});

// --- DATABASE CONNECTION & SEEDING ---
mongoose.connect(process.env.DBurl)
    .then(async () => {
        console.log("🚀 MongoDB Connected Successfully");
        
        // TTL Index for temporary orders (2 hours)
        try {
            await mongoose.connection.db.collection('orders').createIndex({ "orderDate": 1 }, { expireAfterSeconds: 7200 });
        } catch (e) {
            console.log("TTL Index already exists or error.");
        }

        // --- PRODUCT SEEDING (16 ITEMS) ---
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                { id: 'aloo', name: 'Potato (Aloo)', price: 20, img: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg', unit: 'kg', inStock: true },
                { id: 'tomato', name: 'Tomato (Tamatar)', price: 30, img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg', unit: 'kg', inStock: true },
                { id: 'onion', name: 'Onion (Pyaz)', price: 25, img: 'https://media.istockphoto.com/id/1181631588/photo/onions-for-sale.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzL0b1DNEWUehYWVqYzY9qE-ZK88KJgO6eY-etuQYoc=', unit: 'kg', inStock: true },
                { id: 'bhindi', name: 'Lady Finger (Bhindi)', price: 35, img: 'https://media.istockphoto.com/id/1503362390/photo/okra.jpg?s=1024x1024&w=is&k=20&c=xYk1xHhyPEMiZzYxaBu5IMyqXK3qdrlCVVFh8Yy4GgM=', unit: 'kg', inStock: true },
                { id: 'lauki', name: 'Bottle Gourd (Lauki)', price: 18, img: 'https://media.istockphoto.com/id/1194258667/photo/bottle-gourd.jpg?s=1024x1024&w=is&k=20&c=rmDr-KGaiUEaxCqaEQ6e_MakDj6klaXYE-StTySjPUM=', unit: 'kg', inStock: true },
                { id: 'karela', name: 'Bitter Gourd (Karela)', price: 28, img: 'https://media.istockphoto.com/id/472402096/photo/bitter-gourds.jpg?s=612x612&w=0&k=20&c=n7Ua0o7X4Qe_FSfl38ufHIPslxofgkyNpa2Z2NXmBfM=', unit: 'kg', inStock: true },
                { id: 'gajar', name: 'Carrot (Gajar)', price: 22, img: 'https://images.unsplash.com/photo-1633380110125-f6e685676160?auto=format&fit=crop&w=600', unit: 'kg', inStock: true },
                { id: 'mooli', name: 'Radish (Mooli)', price: 15, img: 'https://media.istockphoto.com/id/903099876/photo/fresh-radish.webp?a=1&b=1&s=612x612&w=0&k=20&c=9oElMWTKZOzIny5ND9MESWmEgG-ONAINWzQL8tSrF04=', unit: 'kg', inStock: true },
                { id: 'baingan', name: 'Brinjal (Baingan)', price: 26, img: 'https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?auto=format&fit=crop&w=600', unit: 'kg', inStock: true },
                { id: 'shimla', name: 'Capsicum (Shimla Mirch)', price: 40, img: 'https://media.istockphoto.com/id/137350104/photo/green-peppers.webp?a=1&b=1&s=612x612&w=0&k=20&c=7u2DZpZoSZIWkSDyvAbxkvNU09BrvPdQCPzM4LcsxvU=', unit: 'kg', inStock: true },
                { id: 'palak', name: 'Spinach (Palak)', price: 20, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600', unit: 'kg', inStock: true },
                { id: 'phool', name: 'Cauliflower (Phool Gobhi)', price: 30, img: 'https://media.istockphoto.com/id/1372304664/photo/cauliflower.webp?a=1&b=1&s=612x612&w=0&k=20&c=lEwN90TtHLVx-r3U9GRyRKmXKzfW4tdeUWRWAcOCX7k=', unit: 'kg', inStock: true },
                { id: 'lemon', name: 'Lemon (Nimbu)', price: 10, img: 'https://media.istockphoto.com/id/871706470/photo/lemons.webp?a=1&b=1&s=612x612&w=0&k=20&c=y-meMhMc9CK-Mtz8vM6JRaIOEeiXPcnbdsGca-KCogM=', unit: 'pc', inStock: true },
                { id: 'lahsoon', name: 'Garlic (Lahsoon)', price: 21, img: 'https://media.istockphoto.com/id/531644839/photo/garlic.webp?a=1&b=1&s=612x612&w=0&k=20&c=kABuNBJXIiwWun2GETzq_Gn_u3M9MlxgTfBFLOZYrnU=', unit: 'kg', inStock: true },
                { id: 'mirch', name: 'Green Chilli (Hari Mirch)', price: 45, img: 'https://media.istockphoto.com/id/942849220/photo/chilli.webp?a=1&b=1&s=612x612&w=0&k=20&c=qsUq5pSQ7j7T4O8UMEUiSgdSSt5DlKybwc7QS_o9Oao=', unit: 'kg', inStock: true },
                { id: 'chana', name: 'Green Chickpeas (Hara Chana)', price: 32, img: 'https://media.istockphoto.com/id/899854420/photo/chana.webp?a=1&b=1&s=612x612&w=0&k=20&c=B_zR-xU5c5WDsJTvZKJAq2MkTJwJ--autmPGFPPoQ3w=', unit: 'kg', inStock: true }
            ];
            await Product.insertMany(initialProducts);
            console.log("✅ 16 Initial Products Seeded Successfully");
        }
        
        const PORT = process.env.PORT || 10000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error("Database connection error:", err));
