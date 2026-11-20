export const CATEGORIES = [
  {
    id: "all",
    name: "All Clothes",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "kids",
    name: "Chhote Bachhe",
    icon: "Smile",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "men",
    name: "Bade Log / Men",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "women-ethnic",
    name: "Ladki (Ethnic)",
    icon: "Flame",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "women-western",
    name: "Ladki (Western)",
    icon: "Crown",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "festive",
    name: "Festive & Party",
    icon: "PartyPopper",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "winterwear",
    name: "Winter Wear",
    icon: "Snowflake",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&auto=format&fit=crop&q=80"
  },
  {
    id: "footwear",
    name: "Footwear",
    icon: "Footprints",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80"
  }
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Royal Banarasi Silk Embroidered Zari Saree with Blouse Piece",
    brand: "Ratu Heritage",
    category: "women-ethnic",
    price: 1499,
    originalPrice: 4999,
    discount: 70,
    rating: 4.6,
    ratingCount: 3840,
    assured: true,
    tag: "Trending #1 in Sarees",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["Free Size (5.5m + 0.8m)"],
    colors: ["Deep Maroon", "Royal Emerald", "Peacock Blue"],
    fabric: "Pure Banarasi Art Silk with Woven Jacquard Border",
    fit: "Traditional Draped Fit",
    washCare: "Dry Clean Preferred",
    deliveryDays: "Tomorrow, 2:00 PM",
    inStock: true,
    stockLeft: 7,
    superCoins: 45,
    description: "Crafted with immaculate royal craftsmanship, this Banarasi Saree is embellished with opulent metallic Zari weave, perfect for weddings, Karwa Chauth, Diwali, and festive receptions.",
    reviews: [
      { id: 101, user: "Pooja Sharma", rating: 5, date: "2 days ago", comment: "Fabric quality is beyond expectations! Flipkart pe aisa premium saree 1500 me milna impossible lag raha tha. Super vibrant!", verified: true },
      { id: 102, user: "Ananya Deshmukh", rating: 4, date: "1 week ago", comment: "Looks identical to the photo. Blouse material is also very thick and rich.", verified: true }
    ]
  },
  {
    id: 2,
    name: "Men Slim Fit Washed Pure Denim Biker Jacket",
    brand: "RoadRider Urban",
    category: "men",
    price: 1299,
    originalPrice: 3499,
    discount: 62,
    rating: 4.4,
    ratingCount: 2190,
    assured: true,
    tag: "Flipkart Choice",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Vintage Blue", "Charcoal Black", "Washed Grey"],
    fabric: "100% Heavyweight Cotton Denim (12.5 oz)",
    fit: "Regular Slim Fit",
    washCare: "Machine Wash Cold inside out",
    deliveryDays: "Delivery in 2 Days",
    inStock: true,
    stockLeft: 12,
    superCoins: 35,
    description: "Rugged yet ultra-stylish, this denim jacket gives your casual outfit an iconic edge. Features dual flap chest pockets, brass button closures, and reinforced stitched hems.",
    reviews: [
      { id: 201, user: "Vikram Malhotra", rating: 5, date: "Yesterday", comment: "Bhai ekdum tagda jacket hai! Heavy quality denim aur fitting bilkul tailor-made jaisi hai.", verified: true },
      { id: 202, user: "Rohan Verma", rating: 4, date: "3 days ago", comment: "Awesome fit. Pair it with a white tee and black jeans, looks 10/10.", verified: true }
    ]
  },
  {
    id: 3,
    name: "Embroidered Anarkali Kurta, Pant & Dupatta Festive Set",
    brand: "Biba Couture",
    category: "women-ethnic",
    price: 1899,
    originalPrice: 5999,
    discount: 68,
    rating: 4.7,
    ratingCount: 4210,
    assured: true,
    tag: "Top Rated Festive",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Rani Pink", "Mustard Yellow", "Powder Blue"],
    fabric: "Chanderi Cotton Silk with Organza Gota Patti Dupatta",
    fit: "Flared Anarkali Silhouette",
    washCare: "Gentle Hand Wash",
    deliveryDays: "Tomorrow, 11:00 AM",
    inStock: true,
    stockLeft: 5,
    superCoins: 50,
    description: "Radiate grace in this intricately hand-worked Anarkali 3-piece ensemble. Features mirror work on the yoke, flared Kali borders, and a flowing scalloped organza dupatta.",
    reviews: [
      { id: 301, user: "Sneha Kapoor", rating: 5, date: "5 days ago", comment: "Wedding ke liye lia tha, everyone was asking where I bought it! Highly recommend RatuMart.", verified: true }
    ]
  },
  {
    id: 4,
    name: "Men's Luxury Jacquard Kurta with Churidar Pyjama",
    brand: "Manyavar Elegance",
    category: "men",
    price: 1699,
    originalPrice: 4499,
    discount: 62,
    rating: 4.5,
    ratingCount: 1845,
    assured: true,
    tag: "Festive Bestseller",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"],
    colors: ["Cream Gold", "Wine Red", "Navy Sapphire"],
    fabric: "Rich Silk Blend Jacquard Weave",
    fit: "Straight Classic Fit with Mandarin Collar",
    washCare: "Dry Clean Only",
    deliveryDays: "Tomorrow, 4:00 PM",
    inStock: true,
    stockLeft: 9,
    superCoins: 40,
    description: "Step into traditional luxury with self-embossed floral Jacquard patterns, antique-finish metallic buttons, and a matching comfortable drawstring churidar.",
    reviews: [
      { id: 401, user: "Aman Gupta", rating: 5, date: "3 days ago", comment: "Fitting is super crisp! Looks like a 5000 Rs designer kurta.", verified: true }
    ]
  },
  {
    id: 5,
    name: "Women French Floral Print Chiffon A-Line Maxi Dress",
    brand: "Zara Chic Studio",
    category: "women-western",
    price: 999,
    originalPrice: 2899,
    discount: 65,
    rating: 4.3,
    ratingCount: 1540,
    assured: true,
    tag: "Summer Vacation Hot Pick",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blush Floral", "Sage Green Floral", "Sky Blue"],
    fabric: "Breathable Georgette Chiffon with Soft Viscose Inner Lining",
    fit: "Tiered A-Line with Elasticated Smocked Waist",
    washCare: "Machine Wash Delicate",
    deliveryDays: "Delivery in 2 Days",
    inStock: true,
    stockLeft: 18,
    superCoins: 25,
    description: "Effortlessly feminine and breezy. Features delicate flutter sleeves, a flattering sweetheart neckline, and tiered ruffled hem that twirls beautifully.",
    reviews: [
      { id: 501, user: "Riya Sen", rating: 5, date: "4 days ago", comment: "So dreamy and comfortable! Vacation photos ke liye perfect outfit.", verified: true }
    ]
  },
  {
    id: 6,
    name: "Men Oversized Heavyweight Cotton Graphic Streetwear Hoodie",
    brand: "Ratu Street",
    category: "winterwear",
    price: 899,
    originalPrice: 2499,
    discount: 64,
    rating: 4.5,
    ratingCount: 3120,
    assured: true,
    tag: "Gen-Z Viral Trend",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Pitch Black", "Forest Green", "Coffee Brown", "Oatmeal Grey"],
    fabric: "380 GSM Heavy Fleece 100% Combed Cotton",
    fit: "Drop-Shoulder Boxy Oversized Fit",
    washCare: "Machine Wash Cold",
    deliveryDays: "Tomorrow, 6:00 PM",
    inStock: true,
    stockLeft: 22,
    superCoins: 25,
    description: "Built for maximum warmth and streetwear swagger. Features high-density back typography print, deep kangaroo pocket, double-lined warm hood with metal aglets.",
    reviews: [
      { id: 601, user: "Karan Singh", rating: 5, date: "6 days ago", comment: "Heavy 380 GSM cloth! Bilkul cozy and warm. Street look is insane.", verified: true }
    ]
  },
  {
    id: 7,
    name: "Boys 3-Piece Tuxedo Blazer, Waistcoat & Trouser Suit Set",
    brand: "Little Gentleman",
    category: "kids",
    price: 1199,
    originalPrice: 3299,
    discount: 63,
    rating: 4.7,
    ratingCount: 890,
    assured: true,
    tag: "Kids Bestseller",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
    colors: ["Midnight Blue", "Classic Black", "Wine Royal"],
    fabric: "Premium Poly-Viscose Suiting Fabric with Satin Lapel",
    fit: "Tailored Smart Fit",
    washCare: "Dry Clean",
    deliveryDays: "Delivery in 2 Days",
    inStock: true,
    stockLeft: 8,
    superCoins: 30,
    description: "Give your little champ a royal party look. Includes single-breasted blazer with satin shawl lapel, matching printed waistcoat, bowtie, and adjustable-waist trousers.",
    reviews: [
      { id: 701, user: "Shalini Trivedi", rating: 5, date: "1 week ago", comment: "My son looked so handsome at his birthday party! Fit is spot on.", verified: true }
    ]
  },
  {
    id: 8,
    name: "Men Casual Lightweight High-Top Retro Street Sneakers",
    brand: "UrbanWalk Pro",
    category: "footwear",
    price: 1099,
    originalPrice: 2999,
    discount: 63,
    rating: 4.3,
    ratingCount: 1650,
    assured: true,
    tag: "Top Rated Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    colors: ["Fire Red & White", "Triple White", "Black Panda"],
    fabric: "Breathable Vegan Leather with Memory Foam Insole",
    fit: "Standard Padded Fit",
    washCare: "Wipe with damp cloth",
    deliveryDays: "Tomorrow, 8:00 PM",
    inStock: true,
    stockLeft: 14,
    superCoins: 30,
    description: "Engineered for style, cushion, and all-day walking comfort. Grippy anti-skid rubber cupsole with shock-absorbing memory foam cushioning.",
    reviews: [
      { id: 801, user: "Mohit Kumar", rating: 4, date: "3 days ago", comment: "Very comfortable sole. Looks like Nike Jordans at a fraction of the cost!", verified: true }
    ]
  },
  {
    id: 9,
    name: "Women Heavily Embroidered Velvet Bridal Lehenga Choli Set",
    brand: "Ratu Royal Bride",
    category: "festive",
    price: 3499,
    originalPrice: 12999,
    discount: 73,
    rating: 4.8,
    ratingCount: 1420,
    assured: true,
    tag: "Mega Deal 73% Off",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["Semi-Stitched (Up to 44 Bust)"],
    colors: ["Deep Crimson Red", "Emerald Royalty", "Plum Velvet"],
    fabric: "Micro Velvet with Dori, Zari, and Sequence Hand Embroidery",
    fit: "Semi-Stitched with 3.8 Meter Flared Can-Can Included",
    washCare: "Specialist Dry Clean Only",
    deliveryDays: "Delivery in 3 Days",
    inStock: true,
    stockLeft: 4,
    superCoins: 90,
    description: "A show-stopping bridal creation featuring dense intricate gold Zari threadwork, shimmering micro sequins, heavy latkan tassels, and a double dupatta set.",
    reviews: [
      { id: 901, user: "Meera Singhal", rating: 5, date: "Yesterday", comment: "Breathtaking! The velvet and embroidery have a royal heavy feel. Absolutely in love with RatuMart!", verified: true }
    ]
  },
  {
    id: 10,
    name: "Men Regular Fit Pure Linen Breathable Casual Shirt",
    brand: "Allen Solly Casuals",
    category: "men",
    price: 799,
    originalPrice: 2299,
    discount: 65,
    rating: 4.2,
    ratingCount: 3410,
    assured: true,
    tag: "Everyday Essential",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"],
    colors: ["Crisp White", "Pastel Sky Blue", "Olive Sage", "Dusty Pink"],
    fabric: "100% Breathable Organic Linen-Cotton Weave",
    fit: "Modern Regular Fit with Curved Hem",
    washCare: "Machine Wash Warm",
    deliveryDays: "Tomorrow, 12:00 PM",
    inStock: true,
    stockLeft: 30,
    superCoins: 20,
    description: "Keep it effortlessly crisp and stylish in warm Indian weather. Cut from natural linen fibres that soften with every wash, featuring mother-of-pearl buttons.",
    reviews: [
      { id: 1001, user: "Sameer Joshi", rating: 5, date: "3 days ago", comment: "Best linen shirt at this price tag. Highly breathable and premium texture.", verified: true }
    ]
  },
  {
    id: 11,
    name: "Women Oversized Teddy Fleece Warm Winter Coat",
    brand: "Nordic Warmth",
    category: "winterwear",
    price: 1599,
    originalPrice: 4599,
    discount: 65,
    rating: 4.6,
    ratingCount: 1120,
    assured: true,
    tag: "Winter Bestseller",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Caramel Beige", "Teddy Brown", "Snow Off-White"],
    fabric: "Plush Sherpa Fleece with Satin Insulated Lining",
    fit: "Oversized Relaxed Cocoon Silhouette",
    washCare: "Dry Clean Only",
    deliveryDays: "Tomorrow, 7:00 PM",
    inStock: true,
    stockLeft: 6,
    superCoins: 40,
    description: "The ultimate cozy winter statement piece. Ultra-soft faux shearling texture, notched lapels, deep side pockets, and tortoise-shell button fastenings.",
    reviews: [
      { id: 1101, user: "Priya Nair", rating: 5, date: "1 week ago", comment: "So soft and cozy! Felt like wearing a warm cloud on my trip to Manali.", verified: true }
    ]
  },
  {
    id: 12,
    name: "Girls Princess Sparkle Sequin Tiered Birthday Party Dress",
    brand: "Tiny Diva Couture",
    category: "kids",
    price: 849,
    originalPrice: 2499,
    discount: 66,
    rating: 4.5,
    ratingCount: 960,
    assured: true,
    tag: "Kids Party Wear",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=700&auto=format&fit=crop&q=80"
    ],
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs"],
    colors: ["Lavender Shimmer", "Rose Quartz", "Frozen Ice Blue"],
    fabric: "Soft Tulle Net with 100% Breathable Cotton Inner Lining",
    fit: "Flared Princess Gown with Big Back Satin Bow",
    washCare: "Gentle Hand Wash Cold",
    deliveryDays: "Delivery in 2 Days",
    inStock: true,
    stockLeft: 11,
    superCoins: 20,
    description: "Designed to make every girl feel like royalty on her birthday! Fluffy multi-tier tulle layers with zero scratchy inner fabric, completely lined in pure soft cotton.",
    reviews: [
      { id: 1201, user: "Divya Agarwal", rating: 5, date: "4 days ago", comment: "My daughter refused to take it off! Zero itching and pure princess feel.", verified: true }
    ]
  }
];

export const BANK_OFFERS = [
  { bank: "Flipkart Axis Bank", offer: "5% Unlimited Cashback on every purchase" },
  { bank: "HDFC Bank Cards", offer: "Flat ₹150 Instant Off on orders above ₹1,499" },
  { bank: "UPI Payment", offer: "Extra ₹50 Off via Google Pay, PhonePe & Paytm" },
  { bank: "Ratu VIP Club", offer: "Free Express Delivery + 2X RatuCoins Reward" }
];

export const COUPONS = [
  { code: "RATU50", discountPercent: 50, maxDiscount: 500, minOrder: 999, description: "Flat 50% Off up to ₹500 on all fashion items" },
  { code: "FIRSTORDER", flatDiscount: 150, minOrder: 499, description: "Flat ₹150 Off + FREE Express Delivery on your first purchase" },
  { code: "FESTIVE100", flatDiscount: 100, minOrder: 799, description: "Instant ₹100 Flat discount on festive wear" }
];
