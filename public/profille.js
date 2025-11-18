// ============= CONSTANTS =============
const API_BASE_URL = 'https://my-web-xrr5.onrender.com';
const REQUEST_TIMEOUT = 10000;

// ============= PRODUCTS DATA =============
const products = [
  { id: 'aloo', name: 'आलू', price: 20, emoji: '🥔', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg' },
  { id: 'tomato', name: 'टमाटर', price: 30, emoji: '🍅', img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { id: 'onion', name: 'प्याज़', price: 25, emoji: '🧅', img: 'https://media.istockphoto.com/id/1181631588/photo/onions-for-sale-in-the-weekly-market-malkapur-maharashtra.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzL0b1DNEWUehYWVqYzY9qE-ZK88KJgO6eY-etuQYoc=' },
  { id: 'bhindi', name: 'भिंडी', price: 35, emoji: '🌱', img: 'https://media.istockphoto.com/id/1503362390/photo/okra-over-wooden-table-background-cut-okra-and-whole-ladys-finger.jpg?s=1024x1024&w=is&k=20&c=xYk1xHhyPEMiZzYxaBu5IMyqXK3qdrlCVVFh8Yy4GgM=' },
  { id: 'lauki', name: 'लौकी', price: 18, emoji: '🥒', img: 'https://media.istockphoto.com/id/1194258667/photo/bottle-gourd-for-sale-in-market.jpg?s=1024x1024&w=is&k=20&c=rmDr-KGaiUEaxCqaEQ6e_MakDj6klaXYE-StTySjPUM=' },
  { id: 'karela', name: 'करेला', price: 28, emoji: '🥒', img: 'https://media.istockphoto.com/id/472402096/photo/top-view-of-green-bitter-gourds-in-the-basket.jpg?s=612x612&w=0&k=20&c=n7Ua0o7X4Qe_FSfl38ufHIPslxofgkyNpa2Z2NXmBfM=' },
  { id: 'gajar', name: 'गाजर', price: 22, emoji: '🥕', img: 'https://images.unsplash.com/photo-1633380110125-f6e685676160?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2Fycm90fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600' },
  { id: 'mooli', name: 'मूली', price: 15, emoji: '🌿', img: 'https://media.istockphoto.com/id/903099876/photo/fresh-vegetable-for-sale-on-market-in-india.webp?a=1&b=1&s=612x612&w=0&k=20&c=9oElMWTKZOzIny5ND9MESWmEgG-ONAINWzQL8tSrF04=' },
  { id: 'baingan', name: 'बैंगन', price: 26, emoji: '🍆', img: 'https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnJpbmphbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600' },
  { id: 'shimla', name: 'शिमला मिर्च', price: 40, emoji: '🫑', img: 'https://media.istockphoto.com/id/137350104/photo/green-peppers.webp?a=1&b=1&s=612x612&w=0&k=20&c=7u2DZpZoSZIWkSDyvAbxkvNU09BrvPdQCPzM4LcsxvU=' },
  { id: 'mirch', name: 'हरी मिर्च', price: 45, emoji: '🌶️', img: 'https://media.istockphoto.com/id/942849220/photo/ripe-green-chilli-pepper.webp?a=1&b=1&s=612x612&w=0&k=20&c=qsUq5pSQ7j7T4O8UMEUiSgdSSt5DlKybwc7QS_o9Oao=' },
  { id: 'palak', name: 'पालक', price: 20, emoji: '🥬', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600' },
  { id: 'methi', name: 'मेथी', price: 22, emoji: '🌿', img: 'https://media.istockphoto.com/id/153556198/photo/methi.webp?a=1&b=1&s=612x612&w=0&k=20&c=-wKqvG-vDYf-QVH8D3P2TAxMk-Eryd6haPNtsQBxGrk=' },
  { id: 'sarso', name: 'सरसों', price: 24, emoji: '🌱', img: 'https://media.istockphoto.com/id/641036946/photo/edible-mustard-leaves.webp?a=1&b=1&s=612x612&w=0&k=20&c=gIn92_8eHjFUDcWkN14jJL3ku7nhrnw5BtshSCdsW0c=' },
  { id: 'patta', name: 'पत्ता गोभी', price: 19, emoji: '🥬', img: 'https://media.istockphoto.com/id/2225922723/photo/fresh-green-cabbages-in-a-market-basket.webp?a=1&b=1&s=612x612&w=0&k=20&c=CTgx7YR6b8cJq1jLs0UbelWSqN0dx9N4t3z7pk8b27U=' },
  { id: 'phool', name: 'फूल गोभी', price: 30, emoji: '🥦', img: 'https://media.istockphoto.com/id/1372304664/photo/group-of-cauliflower-fresh-cauliflower-for-sale-at-a-market.webp?a=1&b=1&s=612x612&w=0&k=20&c=lEwN90TtHLVx-r3U9GRyRKmXKzfW4tdeUWRWAcOCX7k=' },
  { id: 'lemon', name: 'नींबू', price: 10, emoji: '🍋', img: 'https://media.istockphoto.com/id/871706470/photo/group-of-fresh-lemon-on-an-old-vintage-wooden-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=y-meMhMc9CK-Mtz8vM6JRaIOEeiXPcnbdsGca-KCogM=' },
  { id: 'lahsoon', name: 'लहसुन', price: 21, emoji: '🧄', img: 'https://media.istockphoto.com/id/531644839/photo/garlic.webp?a=1&b=1&s=612x612&w=0&k=20&c=kABuNBJXIiwWun2GETzq_Gn_u3M9MlxgTfBFLOZYrnU=' },
  { id: 'arbi', name: 'अरबी', price: 27, emoji: '🌱', img: 'https://media.istockphoto.com/id/1200642688/photo/eddoes.webp?a=1&b=1&s=612x612&w=0&k=20&c=HWw27eB0yUyGaP8SDrOktNkL8_Jj9kmBskf5wsZ9u8U=' },
  { id: 'chana', name: 'हरा चना', price: 32, emoji: '🌾', img: 'https://media.istockphoto.com/id/899854420/photo/fresh-green-chickpeas-or-chick-peas-also-known-as-harbara-or-harbhara-in-hindi-and-cicer-is.webp?a=1&b=1&s=612x612&w=0&k=20&c=B_zR-xU5c5WDsJTvZKJAq2MkTJwJ--autmPGFPPoQ3w=' }
];

// ============= UTILITY FUNCTIONS =============
function showPopup(message, isError = false) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.classList.add("show");
  popup.classList.toggle("error", isError);
  
  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);

  console.log(isError ? "❌" : "✅", message);
}

function el(id) {
  return document.getElementById(id);
}

// ============= RENDER PRODUCTS =============
function renderProducts() {
  const section = el("productSection");
  
  section.innerHTML = products.map(prod => {
    const quantityOptions = Array.from({ length: 10 }, (_, i) => {
      const q = i + 1;
      return `<option value="${q}" ${q === 1 ? 'selected' : ''}>${q} किलो</option>`;
    }).join('');

    return `
      <div class="card">
        <img src="${prod.img}" alt="${prod.emoji} ${prod.name}" loading="lazy" />
        <h3>${prod.emoji} ${prod.name}</h3>
        <p>₹${prod.price} / किलो</p>
        <select id="qty-${prod.id}" onchange="updatePrice('${prod.id}', ${prod.price})">
          ${quantityOptions}
        </select>
        <p id="price-${prod.id}">कुल कीमत: ₹${prod.price}</p>
        <button onclick="addToCart('${prod.name}', '${prod.emoji}', ${prod.price}, 'qty-${prod.id}')">
          🛒 जोड़ें
        </button>
      </div>
    `;
  }).join('');

  console.log("✅ Products rendered:", products.length);
}

// ============= UPDATE PRICE =============
function updatePrice(id, rate) {
  const qty = parseFloat(el(`qty-${id}`).value);
  const total = Math.round(rate * qty);
  el(`price-${id}`).textContent = `कुल कीमत: ₹${total}`;
}

// ============= ADD TO CART =============
async function addToCart(name, emoji, rate, selectId) {
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
    const token = localStorage.getItem("token");

    if (!user || !user._id || !token) {
      showPopup("❌ कृपया पहले लॉगिन करें", true);
      window.location.href = "login.html";
      return;
    }

    const qty = parseFloat(el(selectId).value);
    const total = Math.round(rate * qty);

    console.log("🔄 Adding to cart:", { name, qty, total });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(`${API_BASE_URL}/cart/add/${user._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: name,
        name,
        qty,
        price: rate
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (res.ok && data.message) {
      showPopup(`✅ ${emoji} ${name} कार्ट में जोड़ा गया!`);
      console.log("✅ Cart updated:", data);
    } else {
      throw new Error(data.error || "कार्ट में जोड़ने में समस्या");
    }
  } catch (err) {
    console.error("❌ Error:", err);
    
    let errorMsg = "❌ कार्ट में जोड़ने में समस्या हुई";
    if (err.name === 'AbortError') {
      errorMsg = "❌ Request timeout - कनेक्शन जांचें";
    } else if (err instanceof TypeError) {
      errorMsg = "❌ नेटवर्क त्रुटि";
    }
    
    showPopup(errorMsg, true);
  }
}

// ============= LOAD USER PROFILE =============
function loadUserProfile() {
  try {
    const user = JSON.parse(localStorage.getItem("userData"));

    if (user && user._id) {
      el("profile-name").textContent = user.name || "नहीं मिला";
      el("profile-email").textContent = user.email || "नहीं मिला";
      el("profile-phone").textContent = user.phone || "नहीं मिला";
      el("profile-address").textContent = user.address || "नहीं मिला";
      el("profile-pincode").textContent = user.pincode || "नहीं मिला";

      console.log("✅ Profile loaded:", user.name);
    } else {
      showPopup("❌ User data नहीं मिला", true);
      setTimeout(() => {
        localStorage.clear();
        window.location.replace("login.html");
      }, 2000);
    }
  } catch (err) {
    console.error("❌ Error loading profile:", err);
    showPopup("❌ प्रोफाइल लोड करने में त्रुटि", true);
    localStorage.clear();
    window.location.replace("login.html");
  }
}

// ============= LOGOUT =============
function logout() {
  if (confirm("क्या आप सुनिश्चित हैं कि आप logout करना चाहते हैं?")) {
    localStorage.clear();
    console.log("🚪 Logged out successfully");
    showPopup("✅ आप logout हो गए हैं");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}

// ============= SCROLL TO SECTION =============
function scrollToSection(sectionId) {
  const section = el(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    console.log("📍 Scrolled to section:", sectionId);
  }
}

// ============= GO TO CART =============
function goToCart() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "cart.html";
  } else {
    showPopup("❌ कृपया पहले लॉगिन करें", true);
    window.location.href = "login.html";
  }
}

// ============= PAGE LOAD INITIALIZATION =============
window.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Profile page loaded");

  // Session check
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userData"));

  if (!token || !user || !user._id) {
    console.warn("❌ No valid session");
    localStorage.clear();
    window.location.replace("login.html");
    return;
  }

  // Load content
  loadUserProfile();
  renderProducts();

  console.log("✅ Profile page initialized successfully");
});

// ============= ERROR HANDLING =============
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled rejection:', event.reason);
});

console.log("✅ profile.js loaded");
