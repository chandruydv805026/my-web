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

// Models
const User = require("./models/schema");
const Cart = require("./models/cart");
const Order = require("./models/order");
const Product = require("./models/product"); 
const Banner = require("./models/banner");

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- MULTER CONFIG ---
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

// --- CONSTANTS ---
const SHOP_LAT = 23.414336; 
const SHOP_LNG = 85.216316;
const MAX_DISTANCE_KM = 5;
const ADMIN_EMAIL = "ck805026@gmail.com"; 
const ADMIN_PASSWORD_SECRET = process.env.ADMIN_PASSWORD;

const ONESIGNAL_APP_ID = (process.env.ONESIGNAL_APP_ID || "").trim();
const ONESIGNAL_REST_KEY = (process.env.ONESIGNAL_REST_KEY || "").trim();

// --- MIDDLEWARE ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token || token === "null") {
        return res.status(401).json({ error: "Access Denied. Login Required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const loginOtpStore = {};

// --- 1. PRODUCT ROUTES ---
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.post("/api/products/add", upload.single('image'), async (req, res) => {
    const { name, price, unit, inStock, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) return res.status(403).json({ error: "Unauthorized" });
    try {
        const newProduct = new Product({
            id: name.toLowerCase().split(' ').join('-'),
            name, price: Number(price), unit: unit || 'kg',
            inStock: inStock === 'true', img: `/uploads/${req.file.filename}` 
        });
        await newProduct.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Add failed" }); }
});

app.put("/api/products/update/:id", async (req, res) => {
    const { name, price, img, password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) return res.status(403).json({ error: "Unauthorized" });
    try {
        const updated = await Product.findOneAndUpdate({ id: req.params.id }, { name, price, img }, { new: true });
        res.json({ success: true, product: updated });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.delete("/api/products/delete/:id", async (req, res) => {
    const { password } = req.body; 
    if (password !== ADMIN_PASSWORD_SECRET) return res.status(403).json({ error: "Unauthorized" });
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- 2. BANNER ROUTES ---
app.post("/api/banners/add", upload.single('image'), async (req, res) => {
    const { title, password } = req.body;
    if (password !== ADMIN_PASSWORD_SECRET) return res.status(403).json({ error: "Unauthorized" });
    try {
        const newBanner = new Banner({ title, img: `/uploads/${req.file.filename}`, active: true });
        await newBanner.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Banner failed" }); }
});

app.get("/api/banners", async (req, res) => {
    try {
        const banners = await Banner.find({ active: true });
        res.json(banners);
    } catch (err) { res.status(500).json({ error: "Fetch banners failed" }); }
});

app.delete("/api/banners/delete/:id", async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- 3. GEOLOCATION ---
app.post("/reverse-geocode", async (req, res) => {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: "Missing coords" });
    if (getDistance(SHOP_LAT, SHOP_LNG, lat, lng) > MAX_DISTANCE_KM) return res.status(400).json({ error: "Out of area (5km limit)" });
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const response = await axios.get(url, { headers: { "User-Agent": "RatuFreshApp/1.1" } });
        const data = response.data;
        res.json({ displayName: data.display_name, pincode: data.address.postcode || '', area: data.address.suburb || 'Local Area' });
    } catch (err) { res.status(500).json({ error: "Location error" }); }
});

// --- 4. AUTH & MAGIC LINK ---
app.post("/api/signup/magic-link", async (req, res) => {
    const { name, email, phone, address, pincode, area, lat, lng } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(400).json({ error: "Already registered." });

        const mToken = crypto.randomBytes(32).toString("hex");
        const newUser = new User({ name, email, phone, address, pincode, area, lat, lng, verificationToken: mToken, tokenExpiry: Date.now() + 3600000 });
        await newUser.save();

        const verifyUrl = `https://ratufresh.me/api/verify-email?token=${mToken}`;
        await resend.emails.send({
            from: 'Ratu Fresh <otp@ratufresh.me>', to: email,
            subject: `नमस्ते ${name}, Verify Account!`,
            html: `<div style="text-align:center; padding:20px; border:1px solid #24b637; border-radius:15px;">
                   <h2>Welcome!</h2><a href="${verifyUrl}" style="background:#24b637; color:white; padding:15px 25px; text-decoration:none; border-radius:10px; display:inline-block;">Verify Account ✨</a>
                   </div>`
        });
        res.json({ success: true, message: "Magic Link sent" });
    } catch (err) { res.status(500).json({ error: "Signup error" }); }
});

app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ verificationToken: token, tokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).send("Link expired.");

        user.isVerified = true; user.verificationToken = undefined; user.tokenExpiry = undefined;
        await user.save();

        if (!(await Cart.findOne({ user: user._id }))) await new Cart({ user: user._id, items: [] }).save();

        const loginToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "90d" });
        res.redirect(`https://ratufresh.me/profiles.html?token=${loginToken}&verified=true`);
    } catch (err) { res.status(500).send("Error"); }
});

app.post("/login", async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ error: "Not registered" });
        const otp = Math.floor(100000 + Math.random() * 900000);
        loginOtpStore[phone] = { otp, expires: Date.now() + 300000 };
        await resend.emails.send({ from: 'Ratu Fresh <otp@ratufresh.me>', to: user.email, subject: `OTP: ${otp}`, html: `<h1>${otp}</h1>` });
        res.json({ success: true, message: "OTP Sent" });
    } catch (err) { res.status(500).json({ error: "Login failed" }); }
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
    res.status(401).json({ error: "Invalid OTP" });
});

// --- 5. USER PROFILE ---
app.get("/api/user-profile", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ error: "Profile error" }); }
});

app.put("/user/update", authenticate, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
        res.json({ success: true, user: updated });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- 6. CART OPERATIONS ---
app.get("/cart/get", authenticate, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.userId });
        if (cart && cart.items.length > 0) {
            let total = 0; let changed = false;
            for (let item of cart.items) {
                const p = await Product.findOne({ id: item.productId });
                if (p && item.price !== p.price) { item.price = p.price; item.subtotal = p.price * item.quantity; changed = true; }
                total += (item.price * item.quantity);
            }
            if (changed) { cart.totalPrice = total; await cart.save(); }
        }
        res.json(cart || { items: [], totalPrice: 0 });
    } catch (err) { res.status(500).json({ error: "Cart error" }); }
});

app.post("/cart/sync", authenticate, async (req, res) => {
    try {
        const { item } = req.body;
        const p = await Product.findOne({ id: item.productId });
        if (p) { item.price = p.price; item.subtotal = p.price * item.quantity; }
        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) cart = new Cart({ user: req.user.userId, items: [item], totalPrice: item.subtotal });
        else {
            const idx = cart.items.findIndex(x => x.productId === item.productId);
            if (idx > -1) { cart.items[idx].quantity = item.quantity; cart.items[idx].price = item.price; cart.items[idx].subtotal = item.subtotal; }
            else cart.items.push(item);
            cart.totalPrice = cart.items.reduce((a, b) => a + b.subtotal, 0);
        }
        await cart.save(); res.json({ success: true, cart });
    } catch (err) { res.status(500).json({ error: "Sync failed" }); }
});

app.delete("/cart/remove/:productId", authenticate, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.userId });
        if (cart) {
            cart.items = cart.items.filter(i => i.productId !== req.params.productId);
            cart.totalPrice = cart.items.reduce((a, b) => a + b.subtotal, 0);
            await cart.save(); res.json({ success: true, cart });
        } else res.status(404).json({ error: "Not found" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- 7. ORDER OPERATIONS ---
app.get("/orders/my-orders", authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.post("/orders/place", authenticate, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId });
        const user = await User.findById(req.user.userId);
        if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Empty cart" });

        const orderItems = cart.items.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price }));
        const newOrder = new Order({
            userId: req.user.userId, phone: user.phone, items: orderItems,
            totalAmount: cart.totalPrice, deliveryAddress: req.body.address || user.address,
            status: "Pending", orderDate: new Date()
        });
        const saved = await newOrder.save();

        // [EMAIL ACTION LOGIC] - Status + Stock Buttons
        const adminKey = process.env.ADMIN_PASSWORD;
        const statusUrl = (s) => `https://ratufresh.me/api/admin/email-status?orderId=${saved._id}&status=${encodeURIComponent(s)}&pass=${adminKey}`;
        
        // सामानों की लिस्ट ईमेल के लिए तैयार करें
        const itemsHtml = orderItems.map(i => `<li>${i.name} - ${i.quantity}</li>`).join('');

        await resend.emails.send({
            from: 'Ratu Fresh <otp@ratufresh.me>', to: ADMIN_EMAIL,
            subject: `New Order #${saved._id.toString().substring(0,8)} Received! 🥬`,
            html: `
                <div style="font-family:sans-serif; border:2px solid #2e7d32; padding:20px; border-radius:15px; max-width:500px;">
                    <h2 style="color:#2e7d32;">New Order Alert!</h2>
                    <p><b>Customer:</b> ${user.name}</p>
                    <p><b>Phone:</b> ${user.phone}</p>
                    <p><b>Address:</b> ${req.body.address || user.address}</p>
                    <p><b>Items:</b><ul>${itemsHtml}</ul></p>
                    <p><b>Total:</b> ₹${cart.totalPrice}</p>
                    <hr>
                    <p><b>Update Status:</b></p>
                    <div style="margin-bottom:20px;">
                        <a href="${statusUrl('Out for Delivery')}" style="background:#9c27b0; color:white; padding:10px 15px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:bold; margin-bottom:10px;">🚀 Out for Delivery</a>
                        <a href="${statusUrl('Delivered')}" style="background:#2e7d32; color:white; padding:10px 15px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:bold;">✅ Complete Order</a>
                    </div>
                    <hr>
                    <p style="font-size:12px; color:#777;">Tip: You can manage stock levels from your Admin Dashboard if items are sold out.</p>
                </div>
            `
        });

        await Cart.findOneAndUpdate({ user: req.user.userId }, { items: [], totalPrice: 0 });
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: "Order failed" }); }
});

// ईमेल बटन का काम करने वाला रूट
app.get("/api/admin/email-status", async (req, res) => {
    const { orderId, status, pass } = req.query;
    if (pass !== process.env.ADMIN_PASSWORD) return res.status(403).send("<h1>Access Denied</h1>");
    try {
        await Order.findByIdAndUpdate(orderId, { status: status });
        res.send(`
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h1 style="color:#2e7d32;">Update Successful! ✨</h1>
                <p style="font-size:18px;">Order #${orderId.toString().substring(0,8)} is now <b>${status}</b>.</p>
                <br><a href="https://ratufresh.me" style="background:#2e7d32; color:white; padding:12px 25px; text-decoration:none; border-radius:10px; font-weight:bold;">Go to Website</a>
            </div>
        `);
    } catch (err) { res.status(500).send("<h1>Error updating order</h1>"); }
});

// [STOCK UPDATE ROUTE] - एडमिन के लिए
app.post("/api/admin/update-stock", async (req, res) => {
    const { productId, inStock, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: "Invalid Key" });
    try {
        await Product.findOneAndUpdate({ id: productId }, { inStock: inStock });
        res.json({ success: true, message: "Stock updated" });
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.post("/orders/cancel/:orderId", authenticate, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate({ _id: req.params.orderId, userId: req.user.userId, status: "Pending" }, { status: "Cancelled" }, { new: true });
        if (!order) return res.status(400).json({ error: "Cannot cancel" });
        await resend.emails.send({ from: 'Ratu Fresh <otp@ratufresh.me>', to: ADMIN_EMAIL, subject: `Cancelled Order`, text: `Order #${order._id} cancelled.` });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// --- 8. ADMIN & MISC ---
app.post("/admin/send-broadcast", authenticate, async (req, res) => {
    const { title, message } = req.body;
    try {
        await axios.post("https://onesignal.com/api/v1/notifications", { app_id: ONESIGNAL_APP_ID, included_segments: ["Total Subscriptions"], headings: { "en": title }, contents: { "en": message } }, { headers: { "Authorization": `Basic ${ONESIGNAL_REST_KEY}` } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.post("/api/admin/verify", (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) res.json({ success: true });
    else res.status(401).json({ error: "Invalid Key" });
});

app.get("/ping", (req, res) => res.status(200).send("Alive"));

// --- DB CONNECTION & SEEDING ---
mongoose.connect(process.env.DBurl).then(async () => {
    console.log("🚀 MongoDB Connected");
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
    }
    app.listen(process.env.PORT || 10000, () => console.log(`🚀 Server on 10000`));
}).catch(err => console.error(err));
