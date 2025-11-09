 const products = [
 { id: 'aloo', name: 'आलू', price: 20, img: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg' },
  { id: 'tomato', name: 'टमाटर', price: 30, img: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { id: 'onion', name: 'प्याज़', price: 25, img: 'https://media.istockphoto.com/id/1181631588/photo/onions-for-sale-in-the-weekly-market-malkapur-maharashtra.webp?a=1&b=1&s=612x612&w=0&k=20&c=dzL0b1DNEWUehYWVqYzY9qE-ZK88KJgO6eY-etuQYoc=' },
  { id: 'bhindi', name: 'भिंडी', price: 35, img: 'https://media.istockphoto.com/id/1503362390/photo/okra-over-wooden-table-background-cut-okra-and-whole-ladys-finger.jpg?s=1024x1024&w=is&k=20&c=xYk1xHhyPEMiZzYxaBu5IMyqXK3qdrlCVVFh8Yy4GgM=' },
  { id: 'lauki', name: 'लौकी', price: 18, img: 'https://media.istockphoto.com/id/1194258667/photo/bottle-gourd-for-sale-in-market.jpg?s=1024x1024&w=is&k=20&c=rmDr-KGaiUEaxCqaEQ6e_MakDj6klaXYE-StTySjPUM=' },
  { id: 'karela', name: 'करेला', price: 28, img: 'https://media.istockphoto.com/id/472402096/photo/top-view-of-green-bitter-gourds-in-the-basket.jpg?s=612x612&w=0&k=20&c=n7Ua0o7X4Qe_FSfl38ufHIPslxofgkyNpa2Z2NXmBfM=' },
  { id: 'gajar', name: 'गाजर', price: 22, img: 'https://images.unsplash.com/photo-1633380110125-f6e685676160?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2Fycm90fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600' },
  { id: 'mooli', name: 'मूली', price: 15, img: 'https://media.istockphoto.com/id/903099876/photo/fresh-vegetable-for-sale-on-market-in-india.webp?a=1&b=1&s=612x612&w=0&k=20&c=9oElMWTKZOzIny5ND9MESWmEgG-ONAINWzQL8tSrF04=' },
  { id: 'baingan', name: 'बैंगन', price: 26, img: 'https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnJpbmphbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600' },
  { id: 'shimla', name: 'शिमला मिर्च', price: 40, img: 'https://media.istockphoto.com/id/137350104/photo/green-peppers.webp?a=1&b=1&s=612x612&w=0&k=20&c=7u2DZpZoSZIWkSDyvAbxkvNU09BrvPdQCPzM4LcsxvU=' },
  { id: 'mirch', name: 'हरी मिर्च', price: 45, img: 'https://media.istockphoto.com/id/942849220/photo/ripe-green-chilli-pepper.webp?a=1&b=1&s=612x612&w=0&k=20&c=qsUq5pSQ7j7T4O8UMEUiSgdSSt5DlKybwc7QS_o9Oao=' },
  { id: 'palak', name: 'पालक', price: 20, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600' },
  { id: 'methi', name: 'मेथी', price: 22, img: 'https://media.istockphoto.com/id/153556198/photo/methi.webp?a=1&b=1&s=612x612&w=0&k=20&c=-wKqvG-vDYf-QVH8D3P2TAxMk-Eryd6haPNtsQBxGrk=' },
  { id: 'sarso', name: 'सरसों', price: 24, img: 'https://media.istockphoto.com/id/641036946/photo/edible-mustard-leaves.webp?a=1&b=1&s=612x612&w=0&k=20&c=gIn92_8eHjFUDcWkN14jJL3ku7nhrnw5BtshSCdsW0c=' },
  { id: 'patta', name: 'पत्ता गोभी', price: 19, img: 'https://media.istockphoto.com/id/2225922723/photo/fresh-green-cabbages-in-a-market-basket.webp?a=1&b=1&s=612x612&w=0&k=20&c=CTgx7YR6b8cJq1jLs0UbelWSqN0dx9N4t3z7pk8b27U=' },
  { id: 'phool', name: 'फूल गोभी', price: 30, img:  'https://media.istockphoto.com/id/1372304664/photo/group-of-cauliflower-fresh-cauliflower-for-sale-at-a-market.webp?a=1&b=1&s=612x612&w=0&k=20&c=lEwN90TtHLVx-r3U9GRyRKmXKzfW4tdeUWRWAcOCX7k=' },
  { id: 'lemon', name: 'नींबू', price: 10, img: 'https://media.istockphoto.com/id/871706470/photo/group-of-fresh-lemon-on-an-old-vintage-wooden-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=y-meMhMc9CK-Mtz8vM6JRaIOEeiXPcnbdsGca-KCogM=' },
  { id: 'lahsoon', name: 'लहसुन', price: 21, img: 'https://media.istockphoto.com/id/531644839/photo/garlic.webp?a=1&b=1&s=612x612&w=0&k=20&c=kABuNBJXIiwWun2GETzq_Gn_u3M9MlxgTfBFLOZYrnU=' },
  { id: 'arbi', name: 'अरबी', price: 27, img: 'https://media.istockphoto.com/id/1200642688/photo/eddoes.webp?a=1&b=1&s=612x612&w=0&k=20&c=HWw27eB0yUyGaP8SDrOktNkL8_Jj9kmBskf5wsZ9u8U=' },
  { id: 'chana', name: 'हरा चना', price: 32, img: 'https://media.istockphoto.com/id/899854420/photo/fresh-green-chickpeas-or-chick-peas-also-known-as-harbara-or-harbhara-in-hindi-and-cicer-is.webp?a=1&b=1&s=612x612&w=0&k=20&c=B_zR-xU5c5WDsJTvZKJAq2MkTJwJ--autmPGFPPoQ3w=' }
];
let cart = [];

function showPopup(message, isError = false) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.classList.add("show");
  popup.classList.toggle("error", isError);
  setTimeout(() => popup.classList.remove("show"), 3000);
}

function renderProducts() {
  const section = document.getElementById("productSection");
  section.innerHTML = "";
  products.forEach(prod => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p>₹${prod.price} / किलो</p>
      <select id="qty-${prod.id}" onchange="updatePrice('${prod.id}', ${prod.price})">
        ${Array.from({ length: 10 }, (_, i) => {
          const q = i + 1;
          return `<option value="${q}" ${q === 1 ? 'selected' : ''}>${q} किलो</option>`;
        }).join('')}
      </select>
      <p id="price-${prod.id}">कुल कीमत: ₹${prod.price}</p>
      <button onclick="addToCart('${prod.name}', ${prod.price}, 'qty-${prod.id}')">Add to Cart</button>
    `;
    section.appendChild(card);
  });
}

function updatePrice(id, rate) {
  const qty = parseFloat(document.getElementById("qty-" + id).value);
  const total = Math.round(rate * qty);
  document.getElementById("price-" + id).textContent = `कुल कीमत: ₹${total}`;
}

function addToCart(name, rate, selectId) {
  const user = JSON.parse(localStorage.getItem("userData"));
  const token = localStorage.getItem("token");

  if (!user || !user._id || !token) {
    showPopup("कृपया पहले लॉगिन करें", true);
    window.location.href = "login.html";
    return;
  }

  const qty = parseFloat(document.getElementById(selectId).value);
  const total = Math.round(rate * qty);
  const label = qty < 1 ? `${qty * 1000} ग्राम` : `${qty} किलो`;

  fetch("http://localhost:4000/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: user._id,
      productId: name,
      name,
      quantity: qty,
      price: rate
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.cart) {
      showPopup(`✅ ${label} ${name} जोड़ा गया। कुल ₹${total}`);
    } else {
      showPopup("❌ कुछ गड़बड़ हो गई", true);
    }
  })
  .catch(() => {
    showPopup("❌ Cart जोड़ने में समस्या हुई", true);
  });
}

function logout() {
  localStorage.removeItem("userData");
  localStorage.removeItem("token");
  showPopup("✅ आप लॉगआउट हो गए हैं");
  setTimeout(() => window.location.href = "main.html", 1500);
}

function loadUserProfile() {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (user && user._id) {
    document.getElementById("profile-name").textContent = user.name || "नाम नहीं मिला";
    document.getElementById("profile-email").textContent = user.email || "ईमेल नहीं मिला";
    document.getElementById("profile-phone").textContent = user.phone || "फोन नहीं मिला";
    document.getElementById("profile-address").textContent = user.address || "पता नहीं मिला";
  } else {
    showPopup("User data नहीं मिला", true);
    window.location.href = "login.html";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  products.forEach(p => updatePrice(p.id, p.price));

  const profileToggle = document.getElementById("profileToggle");

  profileToggle.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
});