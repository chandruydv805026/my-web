import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PRODUCTS, COUPONS } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Navigation / View State (Store vs Admin)
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [backendConnected, setBackendConnected] = useState(false);

  // Products Catalog (Synced with SQLite /api/products)
  const [products, setProducts] = useState(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedRating, setSelectedRating] = useState(0);
  const [onlyAssured, setOnlyAssured] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [selectedSize, setSelectedSize] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  // Announcement Bar Text
  const [announcementText, setAnnouncementText] = useState(
    "Grand Fashion Festival: Chhote Bachhe, Bade Log aur Ladkiyo Ka Collection Up to 80% Off!"
  );

  // Coupons List (Synced with /api/coupons)
  const [coupons, setCoupons] = useState(COUPONS);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: "RatuMart",
    tagline: "Chhote Bachhe, Bade Log aur Ladkiyo Ka Fashion Hub",
    freeShippingThreshold: 499,
    deliveryCharge: 40,
    supportPhone: "080-4547-RATU",
    supportEmail: "support@ratumart.com",
    dealTimerHours: 4,
    enableCod: true,
    maintenanceMode: false
  });

  // Customers List
  const [customers, setCustomers] = useState([
    { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul.sharma@example.com", superCoins: 280, totalOrders: 3, city: "New Delhi", joined: "12 Oct 2026", status: "Active" },
    { id: 2, name: "Pooja Verma", phone: "+91 98112 33445", email: "pooja.v@example.com", superCoins: 150, totalOrders: 2, city: "Ranchi", joined: "24 Oct 2026", status: "Active" },
    { id: 3, name: "Vikram Singhal", phone: "+91 97722 88990", email: "vikram.s@example.com", superCoins: 420, totalOrders: 5, city: "Mumbai", joined: "02 Nov 2026", status: "VIP" },
    { id: 4, name: "Ananya Deshmukh", phone: "+91 99201 44556", email: "ananya.d@example.com", superCoins: 90, totalOrders: 1, city: "Pune", joined: "15 Nov 2026", status: "Active" }
  ]);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ratumart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ratumart_wishlist');
      return saved ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  // Orders State (Synced with SQLite /api/orders)
  const [orders, setOrders] = useState([]);

  // User Authentication & JWT
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ratumart_token') || '';
    } catch {
      return '';
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ratumart_user');
      if (saved) return JSON.parse(saved);
      return {
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        email: "rahul.sharma@example.com",
        isLoggedIn: true,
        superCoins: 280,
        address: {
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          street: "Flat 402, Royal Palms Heights, Sector 18",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001"
        }
      };
    } catch {
      return null;
    }
  });

  // Modals visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);

  // Delivery Location
  const [deliveryPincode, setDeliveryPincode] = useState("110001");
  const [deliveryCity, setDeliveryCity] = useState("New Delhi");

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // ================= REAL BACKEND DATA FETCHING ================= //

  const fetchBackendData = async () => {
    try {
      // 1. Fetch Products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success && prodData.products.length > 0) {
          setProducts(prodData.products);
          setBackendConnected(true);
        }
      }

      // 2. Fetch Orders
      const orderRes = await fetch('/api/orders');
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.success) {
          setOrders(orderData.orders);
        }
      }

      // 3. Fetch Coupons
      const coupRes = await fetch('/api/coupons');
      if (coupRes.ok) {
        const coupData = await coupRes.json();
        if (coupData.success && coupData.coupons.length > 0) {
          setCoupons(coupData.coupons);
        }
      }
    } catch (err) {
      console.warn('Backend API connection pending or starting up, using local state:', err);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Sync Cart & Wishlist with localStorage
  useEffect(() => {
    localStorage.setItem('ratumart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ratumart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // ================= REAL BACKEND ACTIONS ================= //

  // 1. Upload Real Clothing Photo to Backend
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Photo uploaded successfully to server!');
        return data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      showToast('Photo upload failed: ' + err.message, 'error');
      return null;
    }
  };

  // 2. Add New Product (Saves to SQLite Database)
  const addProduct = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => [data.product, ...prev]);
        showToast(`Product "${data.product.name.slice(0, 22)}..." saved to database!`);
        return data.product;
      }
    } catch (err) {
      console.error('Backend save error:', err);
    }

    // Fallback if backend offline
    const origPrice = Number(productData.originalPrice) || Number(productData.price);
    const salePrice = Number(productData.price);
    const discount = origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

    const newLocal = {
      id: Date.now(),
      name: productData.name,
      brand: productData.brand || "Ratu Originals",
      category: productData.category || "men",
      price: salePrice,
      originalPrice: origPrice,
      discount,
      rating: 4.8,
      ratingCount: 1,
      assured: Boolean(productData.assured),
      tag: productData.tag || "New Arrival",
      image: productData.image,
      images: [productData.image],
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ["S", "M", "L", "XL"],
      colors: Array.isArray(productData.colors) ? productData.colors : ["Standard"],
      fabric: productData.fabric || "Premium Cotton Blend",
      fit: productData.fit || "Regular Fit",
      washCare: productData.washCare || "Machine Wash",
      deliveryDays: "Tomorrow, 4:00 PM",
      stockLeft: Number(productData.stockLeft) || 20,
      description: productData.description || ""
    };
    setProducts(prev => [newLocal, ...prev]);
    showToast(`Added "${newLocal.name.slice(0, 22)}..."!`);
    return newLocal;
  };

  // 3. Edit / Update Product (Updates SQLite Database)
  const updateProduct = async (id, updatedFields) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.warn('Backend update error:', err);
    }

    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const price = updatedFields.price !== undefined ? Number(updatedFields.price) : p.price;
        const originalPrice = updatedFields.originalPrice !== undefined ? Number(updatedFields.originalPrice) : p.originalPrice;
        const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : p.discount;
        return { ...p, ...updatedFields, price, originalPrice, discount };
      }
      return p;
    }));
    showToast(`Product updated in database!`);
  };

  // 4. Delete Product (Deletes from SQLite Database)
  const deleteProduct = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Product removed from database`, 'info');
  };

  // 5. Update Order Status (Updates SQLite Database)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Backend order update error:', err);
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    showToast(`Order ${orderId} marked as "${newStatus}"!`);
  };

  // 6. Delete Order
  const deleteOrder = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (err) {}
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast(`Order ${orderId} deleted`, 'info');
  };

  // 7. Place Order (Saves Order & Deducts Stock in SQLite)
  const placeOrder = async (orderData) => {
    const payload = {
      address: orderData.address || user?.address,
      items: cart,
      totalAmount: finalTotal,
      savings: totalSavings,
      paymentMethod: orderData.paymentMethod
    };

    let confirmed = null;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.order) {
        confirmed = data.order;
        setOrders(prev => [data.order, ...prev]);
        fetchBackendData(); // refresh stock
      }
    } catch (err) {
      console.warn('Backend order post error:', err);
    }

    if (!confirmed) {
      const fallbackId = `RATU-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      confirmed = {
        id: fallbackId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: "Confirmed",
        deliveryDate: "Expected in 2 Days",
        items: [...cart],
        totalAmount: finalTotal,
        paymentMethod: orderData.paymentMethod,
        address: orderData.address || user?.address
      };
      setOrders(prev => [confirmed, ...prev]);
    }

    setCart([]);
    setAppliedCoupon(null);

    // Trigger Celebration Confetti
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch {}

    return confirmed;
  };

  // 8. Coupons Admin
  const addCoupon = async (coupon) => {
    try {
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
      });
    } catch (err) {}
    setCoupons(prev => [coupon, ...prev]);
    showToast(`Coupon "${coupon.code}" activated!`);
  };

  const deleteCoupon = async (code) => {
    try {
      await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
    } catch (err) {}
    setCoupons(prev => prev.filter(c => c.code !== code));
    showToast(`Coupon "${code}" deleted`, 'info');
  };

  // Store Settings Update
  const updateStoreSettings = (newSettings) => {
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings saved!');
  };

  // Customer Coins Update
  const updateCustomerCoins = (customerId, delta) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, superCoins: Math.max(0, c.superCoins + delta) };
      }
      return c;
    }));
    showToast(`Customer SuperCoins updated!`);
  };

  // Reset to default sample
  const resetDefaultProducts = () => {
    fetchBackendData();
    showToast('Catalog refreshed from SQLite database');
  };

  // ================= REAL EMAIL AUTHENTICATION ================= //

  const loginWithEmail = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true,
        superCoins: data.user.superCoins || 150
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Welcome back, ${loggedUser.name}! 🎉`);
      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const registerWithEmail = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true,
        superCoins: data.user.superCoins || 150
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Account created! Welcome, ${loggedUser.name}! 🎉 (+150 Coins)`);
      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('ratumart_token');
    localStorage.removeItem('ratumart_user');
    showToast('Logged out successfully', 'info');
  };

  // ================= CART LOGIC ================= //

  const addToCart = (product, size = null, color = null, qty = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const chosenColor = color || (product.colors && product.colors[0]) || 'Standard';

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === chosenSize && item.selectedColor === chosenColor
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            ...product,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
            quantity: qty
          }
        ];
      }
    });

    showToast(`Added "${product.name.slice(0, 24)}..." to Cart!`);
  };

  const updateCartQuantity = (index, delta) => {
    setCart(prevCart => {
      const updated = [...prevCart];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
        showToast('Item removed from cart', 'info');
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => {
      const updated = [...prevCart];
      updated.splice(index, 1);
      return updated;
    });
    showToast('Item removed from cart', 'info');
  };

  // Wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to Wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  const moveToCartFromWishlist = (product) => {
    addToCart(product);
    setWishlist(prev => prev.filter(id => id !== product.id));
  };

  // Coupons
  const applyCoupon = (code) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      setCouponError('Invalid Coupon Code!');
      return false;
    }

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (found.minOrder && cartTotal < found.minOrder) {
      setCouponError(`Min order value of ₹${found.minOrder} required!`);
      return false;
    }

    setAppliedCoupon(found);
    setCouponError('');
    showToast(`🎉 Coupon "${found.code}" Applied!`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    showToast('Coupon removed', 'info');
  };

  // Price Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const cartPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const mrpDiscount = cartSubtotal - cartPrice;
  
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent' || appliedCoupon.discountPercent) {
      const pct = appliedCoupon.value || appliedCoupon.discountPercent;
      couponDiscount = Math.min(
        Math.round((cartPrice * pct) / 100),
        appliedCoupon.maxDiscount || appliedCoupon.max_discount || 500
      );
    } else if (appliedCoupon.type === 'flat' || appliedCoupon.flatDiscount) {
      couponDiscount = appliedCoupon.value || appliedCoupon.flatDiscount;
    }
  }

  const freeThreshold = storeSettings?.freeShippingThreshold || 499;
  const deliveryCharge = (cartPrice >= freeThreshold || cart.length === 0) ? 0 : (storeSettings?.deliveryCharge || 40);
  const finalTotal = Math.max(0, cartPrice - couponDiscount + deliveryCharge);
  const totalSavings = mrpDiscount + couponDiscount + (deliveryCharge === 0 && cart.length > 0 ? (storeSettings?.deliveryCharge || 40) : 0);
  const totalEarnedCoins = Math.floor(finalTotal * 0.05);

  // Filtered Products
  const filteredProducts = products.filter(product => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesName = (product.name || '').toLowerCase().includes(q);
      const matchesBrand = (product.brand || '').toLowerCase().includes(q);
      const matchesCategory = (product.category || '').toLowerCase().includes(q);
      const matchesDesc = (product.description || '').toLowerCase().includes(q);
      if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) return false;
    }

    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
      return false;
    }

    if (product.price > priceRange) {
      return false;
    }

    if (selectedRating > 0 && product.rating < selectedRating) {
      return false;
    }

    if (onlyAssured && !product.assured) {
      return false;
    }

    if (selectedDiscount > 0 && product.discount < selectedDiscount) {
      return false;
    }

    if (selectedSize !== 'all') {
      const hasSize = product.sizes && product.sizes.some(s => s.toLowerCase().includes(selectedSize.toLowerCase()));
      if (!hasSize) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return b.discount - a.discount;
    return (b.ratingCount || 0) - (a.ratingCount || 0);
  });

  return (
    <ShopContext.Provider value={{
      // View mode
      isAdminMode,
      setIsAdminMode,
      adminTab,
      setAdminTab,
      backendConnected,

      // Products & CRUD
      products,
      filteredProducts,
      selectedProduct,
      setSelectedProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadPhoto,
      resetDefaultProducts,

      // Announcement & Marketing
      announcementText,
      setAnnouncementText,
      coupons,
      addCoupon,
      deleteCoupon,

      // Store Settings
      storeSettings,
      updateStoreSettings,

      // Customers
      customers,
      updateCustomerCoins,

      // Filters
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      selectedBrand,
      setSelectedBrand,
      priceRange,
      setPriceRange,
      selectedRating,
      setSelectedRating,
      onlyAssured,
      setOnlyAssured,
      selectedDiscount,
      setSelectedDiscount,
      selectedSize,
      setSelectedSize,
      sortBy,
      setSortBy,

      // Cart
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      cartSubtotal,
      cartPrice,
      mrpDiscount,
      couponDiscount,
      deliveryCharge,
      finalTotal,
      totalSavings,
      totalEarnedCoins,

      // Wishlist
      wishlist,
      toggleWishlist,
      moveToCartFromWishlist,

      // Orders & CRUD
      orders,
      placeOrder,
      updateOrderStatus,
      deleteOrder,

      // User & Location
      user,
      setUser,
      token,
      loginWithEmail,
      registerWithEmail,
      logoutUser,
      deliveryPincode,
      setDeliveryPincode,
      deliveryCity,
      setDeliveryCity,

      // Coupons
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      couponError,

      // Modals
      isCartOpen,
      setIsCartOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isOrdersOpen,
      setIsOrdersOpen,
      isAuthOpen,
      setIsAuthOpen,
      isSizeGuideOpen,
      setIsSizeGuideOpen,
      isPincodeModalOpen,
      setIsPincodeModalOpen,

      // Toast
      toast,
      showToast
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
