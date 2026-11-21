import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PRODUCTS, COUPONS } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Navigation / View State (Store vs Admin)
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      return p === '/admin' || p.startsWith('/admin/') || h === '#admin';
    }
    return false;
  });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [backendConnected, setBackendConnected] = useState(false);

  // Sync /admin URL with state
  useEffect(() => {
    const handleLocation = () => {
      if (typeof window !== 'undefined') {
        const p = window.location.pathname.toLowerCase();
        const h = window.location.hash.toLowerCase();
        setIsAdminMode(p === '/admin' || p.startsWith('/admin/') || h === '#admin');
      }
    };

    window.addEventListener('popstate', handleLocation);
    window.addEventListener('hashchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('hashchange', handleLocation);
    };
  }, []);

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
    "Grand Fashion Festival: Exclusive Collection for Kids, Men & Women Up to 80% Off!"
  );

  // Coupons List (Synced with /api/coupons)
  const [coupons, setCoupons] = useState(COUPONS);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: "RatuMart",
    tagline: "India's Premium Fashion Destination for Kids, Men & Women",
    freeShippingThreshold: 499,
    deliveryCharge: 40,
    supportPhone: "+91 99550 54109",
    supportEmail: "support@ratumart.com",
    dealTimerHours: 4,
    enableCod: true,
    maintenanceMode: false
  });

  // Customers List (Synced with /api/customers from MongoDB)
  const [customers, setCustomers] = useState([]);

  // One-time purge of old demo data (Rahul Sharma demo cart & wishlist)
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('ratumart_demo_purged_v2') !== 'true') {
      localStorage.removeItem('ratumart_cart');
      localStorage.removeItem('ratumart_wishlist');
      localStorage.removeItem('ratumart_user');
      localStorage.removeItem('ratumart_token');
      localStorage.setItem('ratumart_demo_purged_v2', 'true');
    }
  } catch {}

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ratumart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Direct Buy Now Item (Bypasses Cart Completely)
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ratumart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email === 'rahul.sharma@example.com' || parsed?.name === 'Rahul Sharma') {
          localStorage.removeItem('ratumart_user');
          localStorage.removeItem('ratumart_token');
          return null;
        }
        return parsed;
      }
      return null;
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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // User Delivery Addresses (Maximum 2)
  const [userAddresses, setUserAddresses] = useState([]);
  const [activeAddressIndex, setActiveAddressIndex] = useState(0);

  // Sync addresses whenever user profile updates
  useEffect(() => {
    if (user) {
      if (user.addresses && user.addresses.length > 0) {
        setUserAddresses(user.addresses);
        setActiveAddressIndex(user.activeAddressIndex || 0);
      } else if (user.address) {
        setUserAddresses([user.address]);
        setActiveAddressIndex(0);
      } else {
        setUserAddresses([]);
        setActiveAddressIndex(0);
      }
    } else {
      setUserAddresses([]);
      setActiveAddressIndex(0);
    }
  }, [user]);

  // Delivery Location
  const [deliveryPincode, setDeliveryPincode] = useState("835222");
  const [deliveryCity, setDeliveryCity] = useState("Ratu, Ranchi");

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

  // ================= BROWSER & MOBILE BACK-BUTTON & SCROLL-LOCK CONTROLLER ================= //
  // Prevents mobile/browser back-button from exiting the website when viewing products, modals, or categories
  // Locks background scroll during open modals and restores exact scroll position on close
  const stateSnapshotRef = useRef({});
  const lastExitPressRef = useRef(0);
  const savedScrollPositionRef = useRef(0);
  const authModalBackHandlerRef = useRef(null);

  // Keep snapshot updated on every render
  stateSnapshotRef.current = {
    selectedProduct,
    isCartOpen,
    isWishlistOpen,
    isCheckoutOpen,
    isOrdersOpen,
    isAuthOpen,
    isSizeGuideOpen,
    isPincodeModalOpen,
    selectedCategory,
    searchTerm,
    isAdminMode
  };

  const isModalActive = Boolean(
    selectedProduct || 
    isAuthOpen || 
    isCartOpen || 
    isWishlistOpen || 
    isCheckoutOpen || 
    isOrdersOpen || 
    isPincodeModalOpen || 
    isSizeGuideOpen
  );

  // Scroll Position Keeper & Background Scroll Lock
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isModalActive) {
      // 1. Capture exact scroll position BEFORE locking body (only if not already fixed)
      if (document.body.style.position !== 'fixed') {
        const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        savedScrollPositionRef.current = currentScrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      }
    } else {
      // 2. Restore exact scroll position when all modals are closed
      if (document.body.style.position === 'fixed') {
        const targetScrollY = savedScrollPositionRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Immediately restore scroll without jump to top
        requestAnimationFrame(() => {
          window.scrollTo(0, targetScrollY);
        });
      }
    }
  }, [isModalActive]);

  // Setup Root and Guard states on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (!window.history.state || !window.history.state.ratumartRoot) {
          window.history.replaceState({ ratumartRoot: true }, '');
          window.history.pushState({ ratumartGuard: true }, '');
        }
      } catch (e) {}
    }
  }, []);

  // Popstate Listener: Intercepts device/browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      // Sync Admin URL if route changed
      if (typeof window !== 'undefined') {
        const p = window.location.pathname.toLowerCase();
        const h = window.location.hash.toLowerCase();
        if (p === '/admin' || p.startsWith('/admin/') || h === '#admin') {
          setIsAdminMode(true);
          return;
        }
      }

      const s = stateSnapshotRef.current;

      // 1. Size Guide Modal
      if (s.isSizeGuideOpen) {
        setIsSizeGuideOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 2. Pincode Modal
      if (s.isPincodeModalOpen) {
        setIsPincodeModalOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 3. Auth Modal (Login/Register)
      if (s.isAuthOpen) {
        if (authModalBackHandlerRef.current && authModalBackHandlerRef.current()) {
          try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
          return;
        }
        setIsAuthOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 4. Checkout Modal
      if (s.isCheckoutOpen) {
        setIsCheckoutOpen(false);
        setBuyNowItem(null);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 5. Orders Modal
      if (s.isOrdersOpen) {
        setIsOrdersOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 6. Cart Drawer
      if (s.isCartOpen) {
        setIsCartOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 7. Wishlist Drawer
      if (s.isWishlistOpen) {
        setIsWishlistOpen(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 8. Product Details Modal (Crucial: User browsing clothing items)
      if (s.selectedProduct) {
        setSelectedProduct(null);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 9. Search Bar Active
      if (s.searchTerm && s.searchTerm.trim() !== '') {
        setSearchTerm('');
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 10. Category Filter Active
      if (s.selectedCategory && s.selectedCategory !== 'all') {
        setSelectedCategory('all');
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }
      // 11. Admin Mode Active
      if (s.isAdminMode) {
        setIsAdminMode(false);
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
        return;
      }

      // 12. Root Store Homepage - Accidental Exit Protection (Double Back to Exit)
      const now = Date.now();
      if (now - lastExitPressRef.current < 2500) {
        // Double-tap detected within 2.5 seconds: allow normal exit
        window.history.back();
      } else {
        lastExitPressRef.current = now;
        showToast("Press Back again to exit RatuMart", "info");
        try { window.history.pushState({ ratumartGuard: true }, ''); } catch {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

      // 2. Fetch Orders (Pass credentials so admin sees all, or customer sees their own)
      const orderRes = await fetch('/api/orders', { credentials: 'include' });
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

      // 4. Fetch Real Customers (MongoDB - Admin Session Protected)
      const custRes = await fetch('/api/customers', { credentials: 'include' });
      if (custRes.ok) {
        const custData = await custRes.json();
        if (custData.success && Array.isArray(custData.customers)) {
          setCustomers(custData.customers);
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

  // 1. Upload Real Clothing Photo to Backend (Cloudinary CDN)
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Photo uploaded successfully to Cloudinary CDN! ☁️');
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

  // 2. Add New Product (Saves to MongoDB Database)
  const addProduct = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // 3. Edit / Update Product (Updates MongoDB Database)
  const updateProduct = async (id, updatedFields) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // 4. Delete Product (Deletes from MongoDB Database)
  const deleteProduct = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Product removed from database`, 'info');
  };

  // 5. Update Order Status (Updates MongoDB Database)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // 6. Delete Order (Deletes from MongoDB Database)
  const deleteOrder = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {}
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast(`Order ${orderId} deleted`, 'info');
  };

  // 7. Place Order (Saves Order & Deducts Stock in SQLite)
  const placeOrder = async (orderData) => {
    const activeItems = buyNowItem ? [buyNowItem] : cart;
    const activeTotal = buyNowItem ? checkoutFinalTotal : finalTotal;
    const activeSavings = buyNowItem ? checkoutTotalSavings : totalSavings;

    const payload = {
      address: orderData.address || user?.address,
      items: activeItems,
      totalAmount: activeTotal,
      savings: activeSavings,
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
        items: [...activeItems],
        totalAmount: activeTotal,
        paymentMethod: orderData.paymentMethod,
        address: orderData.address || user?.address
      };
      setOrders(prev => [confirmed, ...prev]);
    }

    if (buyNowItem) {
      // Direct buy completed: clear buyNowItem, regular cart remains untouched!
      setBuyNowItem(null);
    } else {
      // Cart checkout: empty the cart
      setCart([]);
    }
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
        credentials: 'include',
        body: JSON.stringify(coupon)
      });
    } catch (err) {}
    setCoupons(prev => [coupon, ...prev]);
    showToast(`Coupon "${coupon.code}" activated!`);
  };

  const deleteCoupon = async (code) => {
    try {
      await fetch(`/api/coupons/${code}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {}
    setCoupons(prev => prev.filter(c => c.code !== code));
    showToast(`Coupon "${code}" deleted`, 'info');
  };

  // Store Settings Update
  const updateStoreSettings = (newSettings) => {
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings saved!');
  };

  // Reset to default sample
  const resetDefaultProducts = () => {
    fetchBackendData();
    showToast('Catalog refreshed from SQLite database');
  };

  // ================= REAL EMAIL AUTHENTICATION & SESSION COOKIES ================= //

  // Auto-sync session cookie on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          const restoredUser = {
            ...data.user,
            isLoggedIn: true
          };
          setUser(restoredUser);
          localStorage.setItem('ratumart_user', JSON.stringify(restoredUser));
        }
      })
      .catch(() => {});
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Welcome back, ${loggedUser.name}! 🎉`);

      // Refresh data with newly acquired privileges (e.g. admin orders & customers)
      fetchBackendData();

      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 1. Passwordless Login: Request OTP by Phone OR Email
  const requestLoginOtp = async (identifier) => {
    try {
      const res = await fetch('/api/auth/login-otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { 
          success: false, 
          notFound: data.notFound || false, 
          message: data.message || 'Failed to send login code' 
        };
      }
      showToast(`OTP sent to your registered email! 🔑`);
      return { 
        success: true, 
        email: data.email, 
        maskedEmail: data.maskedEmail, 
        message: data.message 
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // 2. Passwordless Login: Verify OTP
  const verifyLoginOtp = async (email, code) => {
    try {
      const res = await fetch('/api/auth/login-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Welcome back, ${loggedUser.name}! 🎉`);

      // Refresh data with newly acquired privileges (e.g. admin orders & customers)
      fetchBackendData();

      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // 3. Create Account: Request OTP with Address & 5 KM Geofence
  const requestRegisterOtp = async ({ name, email, phone, address, location }) => {
    try {
      const res = await fetch('/api/auth/register-otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, location })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { 
          success: false, 
          distanceKm: data.distanceKm,
          message: data.message || 'Registration request failed' 
        };
      }
      showToast(data.message || 'Verification code sent to email!');
      return { 
        success: true, 
        distanceKm: data.distanceKm,
        message: data.message 
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // 4. Create Account: Verify OTP & Finalize
  const verifyRegisterOtpWithAddress = async (email, code) => {
    try {
      const res = await fetch('/api/auth/register-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Code verification failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Account created! Welcome, ${loggedUser.name}! 🎉`);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const sendRegisterOtp = async ({ name, email, phone }) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send confirmation code');
      }
      showToast(data.message || 'Confirmation code sent to your email!');
      return { success: true, message: data.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const verifyRegisterOtp = async ({ email, code, name, phone }) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, name, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Confirmation code verification failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Account created! Welcome, ${loggedUser.name}! 🎉`);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const saveUserAddress = async (addressData) => {
    try {
      const email = user?.email || addressData.email;
      const res = await fetch('/api/auth/save-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, address: addressData })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save address');
      }

      const updatedUser = {
        ...user,
        address: data.address
      };
      setUser(updatedUser);
      localStorage.setItem('ratumart_user', JSON.stringify(updatedUser));
      showToast('Delivery address saved successfully! 🏠');
      return { success: true, address: data.address };
    } catch (err) {
      const updatedUser = {
        ...user,
        address: addressData
      };
      setUser(updatedUser);
      localStorage.setItem('ratumart_user', JSON.stringify(updatedUser));
      showToast('Delivery address saved! 🏠');
      return { success: true, address: addressData };
    }
  };

  const registerWithEmail = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const loggedUser = {
        ...data.user,
        isLoggedIn: true
      };

      setToken(data.token);
      setUser(loggedUser);
      localStorage.setItem('ratumart_token', data.token);
      localStorage.setItem('ratumart_user', JSON.stringify(loggedUser));
      showToast(`Account created! Welcome, ${loggedUser.name}! 🎉`);
      return { success: true, user: loggedUser };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setUser(null);
    setToken('');
    localStorage.removeItem('ratumart_token');
    localStorage.removeItem('ratumart_user');
    showToast('Logged out successfully', 'info');
  };

  // Multi-Address Management (Max 2 addresses)
  const addUserAddress = async (newAddress) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'add', address: newAddress })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Could not add address', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      setUserAddresses(data.addresses);
      setActiveAddressIndex(data.activeAddressIndex);
      localStorage.setItem('ratumart_user', JSON.stringify(data.user));
      showToast(data.message || 'New address added! 📍');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const editUserAddress = async (index, updatedAddress) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'edit', index, address: updatedAddress })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Could not update address', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      setUserAddresses(data.addresses);
      setActiveAddressIndex(data.activeAddressIndex);
      localStorage.setItem('ratumart_user', JSON.stringify(data.user));
      showToast(data.message || 'Address updated! ✏️');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const selectUserAddress = async (index) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'select', index })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Could not select address', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      setUserAddresses(data.addresses);
      setActiveAddressIndex(data.activeAddressIndex);
      localStorage.setItem('ratumart_user', JSON.stringify(data.user));
      showToast(data.message || 'Delivery address selected! 🚚');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const deleteUserAddress = async (index) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'delete', index })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Could not delete address', 'error');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      setUserAddresses(data.addresses);
      setActiveAddressIndex(data.activeAddressIndex);
      localStorage.setItem('ratumart_user', JSON.stringify(data.user));
      showToast('Address removed', 'info');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
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

  // Price Calculations (Normal Cart)
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

  // Active items for Checkout: direct Buy Now item or normal Cart
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const checkoutSubtotal = checkoutItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const checkoutPrice = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const checkoutMrpDiscount = checkoutSubtotal - checkoutPrice;

  let checkoutCouponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent' || appliedCoupon.discountPercent) {
      const pct = appliedCoupon.value || appliedCoupon.discountPercent;
      checkoutCouponDiscount = Math.min(
        Math.round((checkoutPrice * pct) / 100),
        appliedCoupon.maxDiscount || appliedCoupon.max_discount || 500
      );
    } else if (appliedCoupon.type === 'flat' || appliedCoupon.flatDiscount) {
      checkoutCouponDiscount = appliedCoupon.value || appliedCoupon.flatDiscount;
    }
  }

  const checkoutDeliveryCharge = (checkoutPrice >= freeThreshold || checkoutItems.length === 0) ? 0 : (storeSettings?.deliveryCharge || 40);
  const checkoutFinalTotal = Math.max(0, checkoutPrice - checkoutCouponDiscount + checkoutDeliveryCharge);
  const checkoutTotalSavings = checkoutMrpDiscount + checkoutCouponDiscount + (checkoutDeliveryCharge === 0 && checkoutItems.length > 0 ? (storeSettings?.deliveryCharge || 40) : 0);

  // Direct Buy Now without adding to cart
  const startBuyNow = (product, size = null, color = null, qty = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'Standard';
    const chosenColor = color || (product.colors && product.colors[0]) || 'Standard';

    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      selectedSize: chosenSize,
      selectedColor: chosenColor,
      quantity: qty,
      rating: product.rating
    };

    setBuyNowItem(item);
    setSelectedProduct(null);

    if (!user || !user.isLoggedIn) {
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

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

      // Direct Buy Now (bypasses cart)
      buyNowItem,
      setBuyNowItem,
      startBuyNow,
      checkoutItems,
      checkoutFinalTotal,
      checkoutTotalSavings,

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
      requestLoginOtp,
      verifyLoginOtp,
      requestRegisterOtp,
      verifyRegisterOtpWithAddress,
      registerWithEmail,
      sendRegisterOtp,
      verifyRegisterOtp,
      saveUserAddress,
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
      isAddressModalOpen,
      setIsAddressModalOpen,
      userAddresses,
      activeAddressIndex,
      addUserAddress,
      editUserAddress,
      selectUserAddress,
      deleteUserAddress,
      authModalBackHandlerRef,

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
