import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ratumart.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL,
    audience TEXT NOT NULL, /* 'kids', 'men', 'women' */
    price REAL NOT NULL,
    original_price REAL NOT NULL,
    discount INTEGER,
    rating REAL DEFAULT 4.5,
    rating_count INTEGER DEFAULT 1,
    assured INTEGER DEFAULT 1,
    tag TEXT,
    image TEXT NOT NULL,
    images TEXT,
    sizes TEXT,
    colors TEXT,
    fabric TEXT,
    fit TEXT,
    wash_care TEXT,
    stock_left INTEGER DEFAULT 20,
    delivery_days TEXT DEFAULT 'Tomorrow, 4:00 PM',
    description TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    savings REAL DEFAULT 0,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    delivery_date TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    max_discount REAL,
    min_order REAL DEFAULT 0,
    description TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Pre-seed Products if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
const currentCount = countStmt.get().count;

if (currentCount === 0) {
  console.log('Seeding initial clothes inventory for Kids, Men, and Women...');

  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, brand, category, audience, price, original_price, discount,
      rating, rating_count, assured, tag, image, images, sizes, colors,
      fabric, fit, wash_care, stock_left, delivery_days, description, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const initialItems = [
    // --- 1. KIDS WEAR ---
    {
      name: "Boys 3-Piece Festive Royal Blazer, Waistcoat & Trouser Suit Set",
      brand: "Little Gentleman",
      category: "kids",
      audience: "kids",
      price: 1199,
      original_price: 3299,
      discount: 63,
      rating: 4.8,
      rating_count: 890,
      assured: 1,
      tag: "Kids Party Bestseller",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"]),
      colors: JSON.stringify(["Midnight Blue", "Classic Black", "Wine Royal"]),
      fabric: "Premium Poly-Viscose Suiting Fabric with Satin Lapel",
      fit: "Tailored Smart Fit for Boys",
      wash_care: "Dry Clean Only",
      stock_left: 15,
      delivery_days: "Tomorrow, 2:00 PM",
      description: "Royal 3-piece tailored suit set for boys, ideal for birthdays, weddings, and festive occasions.",
      created_at: new Date().toISOString()
    },
    {
      name: "Girls Princess Sparkle Sequin Tiered Birthday Party Frock Gown",
      brand: "Tiny Diva Couture",
      category: "kids",
      audience: "kids",
      price: 849,
      original_price: 2499,
      discount: 66,
      rating: 4.7,
      rating_count: 960,
      assured: 1,
      tag: "Girls Birthday Gown",
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["1-2 Yrs", "2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs"]),
      colors: JSON.stringify(["Lavender Shimmer", "Baby Pink", "Sky Blue"]),
      fabric: "Soft Fluffy Tulle Net with 100% Cotton Scratch-Free Inner Lining",
      fit: "Flared Princess Gown",
      wash_care: "Gentle Hand Wash Cold",
      stock_left: 22,
      delivery_days: "Tomorrow, 4:00 PM",
      description: "Princess party frock for girls crafted with 100% scratch-free pure cotton inner lining for ultimate comfort.",
      created_at: new Date().toISOString()
    },
    {
      name: "Boys Traditional Silk Kurta & Dhoti Pant Festive Set",
      brand: "Ratu Little Royals",
      category: "kids",
      audience: "kids",
      price: 699,
      original_price: 1899,
      discount: 63,
      rating: 4.6,
      rating_count: 540,
      assured: 1,
      tag: "Festive Kids Pick",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["1-2 Yrs", "3-4 Yrs", "5-6 Yrs", "7-8 Yrs"]),
      colors: JSON.stringify(["Haldi Yellow", "Peacock Green", "Ruby Red"]),
      fabric: "Pure Art Silk with Soft Cotton Lining",
      fit: "Comfortable Festive Dhoti Fit",
      wash_care: "Gentle Machine Wash",
      stock_left: 18,
      delivery_days: "Delivery in 2 Days",
      description: "Comfortable traditional art silk kurta dhoti set for boys, perfect for festivals and puja ceremonies.",
      created_at: new Date().toISOString()
    },

    // --- 2. MEN'S FASHION ---
    {
      name: "Men Slim Fit Washed Pure Denim Biker Jacket",
      brand: "RoadRider Urban",
      category: "men",
      audience: "men",
      price: 1299,
      original_price: 3499,
      discount: 62,
      rating: 4.5,
      rating_count: 2190,
      assured: 1,
      tag: "Bestseller Men's Denim",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify(["Vintage Blue", "Charcoal Black", "Washed Grey"]),
      fabric: "100% Heavyweight Cotton Denim (12.5 oz)",
      fit: "Regular Slim Fit",
      wash_care: "Machine Wash Cold inside out",
      stock_left: 14,
      delivery_days: "Tomorrow, 6:00 PM",
      description: "Rugged denim biker jacket for men featuring heavyweight premium cotton and solid brass buttons.",
      created_at: new Date().toISOString()
    },
    {
      name: "Men's Luxury Jacquard Silk Kurta with Churidar Pyjama Set",
      brand: "Manyavar Elegance",
      category: "men",
      audience: "men",
      price: 1699,
      original_price: 4499,
      discount: 62,
      rating: 4.6,
      rating_count: 1845,
      assured: 1,
      tag: "Festive Wedding Special",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"]),
      colors: JSON.stringify(["Cream Gold", "Wine Red", "Navy Sapphire"]),
      fabric: "Rich Silk Blend Jacquard Weave",
      fit: "Straight Classic Fit with Mandarin Collar",
      wash_care: "Dry Clean Only",
      stock_left: 12,
      delivery_days: "Tomorrow, 1:00 PM",
      description: "Regal self-embossed floral Jacquard kurta set for men designed for traditional ceremonies.",
      created_at: new Date().toISOString()
    },
    {
      name: "Men Regular Fit Pure Linen Breathable Casual Shirt",
      brand: "Allen Solly Casuals",
      category: "men",
      audience: "men",
      price: 799,
      original_price: 2299,
      discount: 65,
      rating: 4.4,
      rating_count: 3410,
      assured: 1,
      tag: "Daily Wear Shirt",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["38 (S)", "40 (M)", "42 (L)", "44 (XL)"]),
      colors: JSON.stringify(["Crisp White", "Pastel Sky Blue", "Olive Sage", "Dusty Pink"]),
      fabric: "100% Breathable Organic Linen-Cotton Weave",
      fit: "Modern Regular Fit with Curved Hem",
      wash_care: "Machine Wash Warm",
      stock_left: 28,
      delivery_days: "Tomorrow, 11:00 AM",
      description: "Breathable pure linen-cotton casual shirt designed for all-day comfort and office wear.",
      created_at: new Date().toISOString()
    },

    // --- 3. WOMEN'S FASHION ---
    {
      name: "Royal Banarasi Silk Embroidered Zari Saree with Blouse Piece",
      brand: "Ratu Heritage",
      category: "women-ethnic",
      audience: "women",
      price: 1499,
      original_price: 4999,
      discount: 70,
      rating: 4.7,
      rating_count: 3840,
      assured: 1,
      tag: "Women's Ethnic #1",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["Free Size (5.5m + 0.8m Blouse)"]),
      colors: JSON.stringify(["Deep Maroon", "Royal Emerald", "Peacock Blue"]),
      fabric: "Pure Banarasi Art Silk with Woven Jacquard Gold Border",
      fit: "Traditional Draped Fit",
      wash_care: "Dry Clean Preferred",
      stock_left: 9,
      delivery_days: "Tomorrow, 3:00 PM",
      description: "Exquisite Banarasi silk saree featuring heavy gold Zari woven borders for weddings and festivities.",
      created_at: new Date().toISOString()
    },
    {
      name: "Embroidered Anarkali Kurta, Pant & Dupatta 3-Piece Festive Set",
      brand: "Biba Couture",
      category: "women-ethnic",
      audience: "women",
      price: 1899,
      original_price: 5999,
      discount: 68,
      rating: 4.8,
      rating_count: 4210,
      assured: 1,
      tag: "Top Rated Kurti Set",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify(["Rani Pink", "Mustard Yellow", "Powder Blue"]),
      fabric: "Chanderi Cotton Silk with Organza Gota Patti Dupatta",
      fit: "Flared Anarkali Silhouette",
      wash_care: "Gentle Hand Wash",
      stock_left: 7,
      delivery_days: "Tomorrow, 12:00 PM",
      description: "Handcrafted mirror-work Anarkali 3-piece ensemble paired with a scalloped organza dupatta.",
      created_at: new Date().toISOString()
    },
    {
      name: "Women Heavily Embroidered Velvet Bridal Lehenga Choli Set",
      brand: "Ratu Royal Bride",
      category: "festive",
      audience: "women",
      price: 3499,
      original_price: 12999,
      discount: 73,
      rating: 4.9,
      rating_count: 1420,
      assured: 1,
      tag: "Bridal Lehenga Steal",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["Semi-Stitched (Up to 44 Bust)"]),
      colors: JSON.stringify(["Deep Crimson Red", "Emerald Royalty", "Plum Velvet"]),
      fabric: "Micro Velvet with Dori, Zari, and Sequence Hand Embroidery",
      fit: "Semi-Stitched with 3.8 Meter Flared Can-Can Included",
      wash_care: "Specialist Dry Clean Only",
      stock_left: 4,
      delivery_days: "Delivery in 3 Days",
      description: "Heavy wedding bridal lehenga set with intricate gold threadwork and double dupatta.",
      created_at: new Date().toISOString()
    },
    {
      name: "Women French Floral Print Chiffon A-Line Maxi Dress",
      brand: "Zara Chic Studio",
      category: "women-western",
      audience: "women",
      price: 999,
      original_price: 2899,
      discount: 65,
      rating: 4.5,
      rating_count: 1540,
      assured: 1,
      tag: "Western Wear Dress",
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80"
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
      colors: JSON.stringify(["Blush Floral", "Sage Green Floral", "Sky Blue"]),
      fabric: "Breathable Georgette Chiffon with Soft Viscose Inner Lining",
      fit: "Tiered A-Line with Elasticated Smocked Waist",
      wash_care: "Machine Wash Delicate",
      stock_left: 19,
      delivery_days: "Tomorrow, 5:00 PM",
      description: "Chic French floral print chiffon maxi dress featuring an elasticated smocked waist.",
      created_at: new Date().toISOString()
    }
  ];

  for (const item of initialItems) {
    insertProduct.run(
      item.name, item.brand, item.category, item.audience, item.price,
      item.original_price, item.discount, item.rating, item.rating_count,
      item.assured, item.tag, item.image, item.images, item.sizes,
      item.colors, item.fabric, item.fit, item.wash_care, item.stock_left,
      item.delivery_days, item.description, item.created_at
    );
  }
}

// Pre-seed default coupons
const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get().count;
if (couponCount === 0) {
  const insertCoupon = db.prepare('INSERT INTO coupons (code, type, value, max_discount, min_order, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertCoupon.run('RATU50', 'percent', 50, 500, 999, 'Flat 50% Off up to ₹500 on all fashion items', 1);
  insertCoupon.run('FIRSTORDER', 'flat', 150, null, 499, 'Flat ₹150 Off + FREE Express Delivery on first purchase', 1);
  insertCoupon.run('FESTIVE100', 'flat', 100, null, 799, 'Instant ₹100 Flat discount on festive wear', 1);
}

// Pre-seed sample orders
const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
if (orderCount === 0) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, customer_name, customer_phone, customer_email, shipping_address, items, total_amount, savings, payment_method, status, delivery_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    'RATU-ORD-84192',
    'Rahul Sharma',
    '+91 98765 43210',
    'rahul.sharma@example.com',
    JSON.stringify({
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      street: 'Flat 402, Royal Palms Heights, Sector 18',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001'
    }),
    JSON.stringify([
      {
        id: 4,
        name: 'Men Slim Fit Washed Pure Denim Biker Jacket',
        brand: 'RoadRider Urban',
        price: 1299,
        originalPrice: 3499,
        selectedSize: 'L',
        selectedColor: 'Vintage Blue',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80'
      }
    ]),
    1299,
    2200,
    'UPI (Google Pay)',
    'Shipped',
    'Expected by Tomorrow, 8 PM',
    '18 Nov 2026'
  );
}

// Pre-seed settings
const settingCount = db.prepare('SELECT COUNT(*) as count FROM store_settings').get().count;
if (settingCount === 0) {
  const insertSetting = db.prepare('INSERT INTO store_settings (key, value) VALUES (?, ?)');
  insertSetting.run('storeName', 'RatuMart');
  insertSetting.run('tagline', "India's Premium Fashion Destination for Kids, Men & Women");
  insertSetting.run('freeShippingThreshold', '499');
  insertSetting.run('deliveryCharge', '40');
  insertSetting.run('supportPhone', '080-4547-RATU');
  insertSetting.run('supportEmail', 'support@ratumart.com');
  insertSetting.run('dealTimerHours', '4');
}

export default db;
