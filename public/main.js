const user = JSON.parse(localStorage.getItem("userData"));
const isLoggedIn = localStorage.getItem("token") && user?._id;
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

window.onload = () => isLoggedIn
  ? location.href = "profiles.html"
  : (renderProducts(), products.forEach(p => updatePrice(p.id, p.price)));

const el = id => document.getElementById(id);

const renderProducts = () => {
  el("productContainer").innerHTML = products.map(({ id, name, price, img }) => `
    <div class="card">
      <img src="${img}" alt="ताज़ा ${name}" />
      <h3>${name}</h3>
      <p>₹${price} / किलो</p>
      <select id="qty-${id}" onchange="updatePrice('${id}', ${price})">
        ${[0.25, 0.5, 1, 2, 3, 4, 5].map(q =>
          `<option value="${q}" ${q === 1 ? 'selected' : ''}>
            ${q < 1 ? q * 1000 + 'g' : q + ' किलो'}
          </option>`).join('')}
      </select>
      <p id="price-${id}">कुल कीमत: ₹${price}</p>
      <button onclick="addToCart('${name}', ${price}, 'qty-${id}')">Add to Cart</button>
    </div>
  `).join('');
};

const updatePrice = (id, rate) => {
  const qty = parseFloat(el(`qty-${id}`).value);
  el(`price-${id}`).textContent = `कुल कीमत: ₹${Math.round(rate * qty)}`;
};

const addToCart = (name, rate, qtyId) => {
  if (!isLoggedIn) return el("loginModal").style.display = "block";
  const qty = parseFloat(el(qtyId).value);
  alert(`${name} (${qty} किलो) को ₹${Math.round(rate * qty)} में कार्ट में जोड़ा गया!`);
};

const filterProducts = () => {
  const input = el("searchInput").value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(input) ? "block" : "none";
  });
};

const closeModal = () => el("loginModal").style.display = "none";

const goToLogin = () => location.href = "login.html";
