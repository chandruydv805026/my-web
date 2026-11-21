import React, { useState } from 'react';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  Phone, Trash2, Printer, Search, Filter, ShieldCheck, Navigation,
  MessageCircle, Copy, Check, ChevronDown, Calendar, RefreshCw, X, 
  AlertCircle, Share2, DollarSign, ArrowRight, UserCheck, ExternalLink
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, showToast } = useShop();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [printingOrder, setPrintingOrder] = useState(null);

  const statuses = [
    { label: "Confirmed", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Packing", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Shipped", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200" }
  ];

  // Overview Counts
  const newOrdersCount = orders.filter(o => o.status === 'Confirmed').length;
  const packingCount = orders.filter(o => o.status === 'Packing').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  
  // Total Cash to Collect (Active Non-Delivered Non-Cancelled COD Orders)
  const pendingCashToCollect = orders
    .filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const totalDeliveredCash = orders
    .filter(o => o.status === 'Delivered')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Filtered orders list
  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      ord.id.toLowerCase().includes(q) || 
      (ord.address?.name || '').toLowerCase().includes(q) ||
      (ord.address?.phone || '').includes(q) ||
      (ord.address?.street || '').toLowerCase().includes(q) ||
      (ord.address?.city || '').toLowerCase().includes(q) ||
      (ord.address?.pincode || '').includes(q);

    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'Active' && ord.status !== 'Delivered' && ord.status !== 'Cancelled') ||
      ord.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const handleCopyOrderId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedOrderId(id);
    showToast(`Order ID #${id} copied!`);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // WhatsApp Customer Message Generator
  const openWhatsAppCustomer = (order) => {
    const phone = (order.address?.phone || '').replace(/\D/g, '').slice(-10);
    if (!phone) {
      showToast("No customer phone number found", "error");
      return;
    }
    const customerName = order.address?.name || 'Customer';
    const text = encodeURIComponent(
      `Namaste ${customerName} ji! 🙏\n` +
      `Aapka RatuMart order *#${order.id}* receive ho gaya hai.\n\n` +
      `📦 Status: *${order.status || 'Confirmed'}*\n` +
      `💵 COD Amount to Pay: *₹${order.totalAmount}*\n` +
      `📍 Delivery To: ${order.address?.street || ''}, Ratu, Ranchi - ${order.address?.pincode || '835222'}\n\n` +
      `Humara delivery executive jald aapke address par parcel lekar pahunchega. Koi bhi help ke liye aap yahan message kar sakte hain!\n` +
      `- RatuMart Hub, Dandai Phutaltoli, Ratu`
    );
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  // WhatsApp Delivery Rider Dispatch Task Generator
  const shareWithDeliveryRider = (order) => {
    const customerName = order.address?.name || 'Customer';
    const phone = order.address?.phone || '';
    const street = order.address?.street || '';
    const landmark = order.address?.landmark ? ` (Near: ${order.address.landmark})` : '';
    const city = order.address?.city || 'Ratu, Ranchi';
    const pincode = order.address?.pincode || '835222';
    const mapUrl = order.address?.lat && order.address?.lng 
      ? `https://www.google.com/maps/dir/?api=1&destination=${order.address.lat},${order.address.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(street + ', ' + city + ' ' + pincode)}`;

    const itemsSummary = (order.items || [])
      .map((it, i) => `${i + 1}. ${it.name} [Size: ${it.selectedSize || 'Free'}, Color: ${it.selectedColor || '-'}, Qty: ${it.quantity}]`)
      .join('\n');

    const riderText = encodeURIComponent(
      `🚚 *RATUMART NEW DELIVERY TASK*\n` +
      `---------------------------------\n` +
      `🆔 Order ID: #${order.id}\n` +
      `👤 Customer: *${customerName}*\n` +
      `📞 Phone: *${phone}*\n` +
      `🏠 Address: ${street}${landmark}, ${city} - ${pincode}\n` +
      `📍 Hub Distance: ${order.address?.distanceKm || 'Within 5'} KM\n` +
      `---------------------------------\n` +
      `💵 *COLLECT CASH (COD): ₹${order.totalAmount}*\n` +
      `---------------------------------\n` +
      `📦 *Items to Deliver:*\n${itemsSummary}\n\n` +
      `🗺️ *Google Maps Navigation:*\n${mapUrl}`
    );

    window.open(`https://wa.me/?text=${riderText}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP METRIC CARDS (Fast overview of daily store operations) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* New Orders */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Confirmed' ? 'all' : 'Confirmed')}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs flex flex-col justify-between ${
            statusFilter === 'Confirmed' 
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300' 
              : 'bg-white hover:border-amber-400 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${statusFilter === 'Confirmed' ? 'text-amber-100' : 'text-slate-500'}`}>
              New Orders
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${newOrdersCount > 0 ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black">{newOrdersCount}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusFilter === 'Confirmed' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
              Need Packing
            </span>
          </div>
        </div>

        {/* Packing In Progress */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Packing' ? 'all' : 'Packing')}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs flex flex-col justify-between ${
            statusFilter === 'Packing' 
              ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300' 
              : 'bg-white hover:border-purple-400 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${statusFilter === 'Packing' ? 'text-purple-100' : 'text-slate-500'}`}>
              Packing
            </span>
            <Package className="w-4 h-4 opacity-70" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black">{packingCount}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusFilter === 'Packing' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'}`}>
              Ready to Dispatch
            </span>
          </div>
        </div>

        {/* Out for Delivery */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Out for Delivery' ? 'all' : 'Out for Delivery')}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs flex flex-col justify-between ${
            statusFilter === 'Out for Delivery' 
              ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300' 
              : 'bg-white hover:border-indigo-400 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${statusFilter === 'Out for Delivery' ? 'text-indigo-100' : 'text-slate-500'}`}>
              On The Way
            </span>
            <Truck className="w-4 h-4 opacity-70" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black">{outForDeliveryCount}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusFilter === 'Out for Delivery' ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
              With Rider
            </span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Delivered' ? 'all' : 'Delivered')}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs flex flex-col justify-between ${
            statusFilter === 'Delivered' 
              ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300' 
              : 'bg-white hover:border-emerald-400 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${statusFilter === 'Delivered' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Delivered
            </span>
            <CheckCircle2 className="w-4 h-4 opacity-70" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black">{deliveredCount}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusFilter === 'Delivered' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              Completed
            </span>
          </div>
        </div>

        {/* COD Cash to Collect */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 sm:p-4 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
              COD Cash to Collect
            </span>
            <DollarSign className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black block">
              ₹{pendingCashToCollect.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium">
              From active pending deliveries
            </span>
          </div>
        </div>

      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Mobile, Locality, Kathitand, Ratu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'Active', label: 'Active Tasks' },
            { id: 'Confirmed', label: 'New' },
            { id: 'Packing', label: 'Packing' },
            { id: 'Out for Delivery', label: 'On Way' },
            { id: 'Delivered', label: 'Delivered' },
            { id: 'Cancelled', label: 'Cancelled' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition whitespace-nowrap active:scale-95 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* 3. ORDERS LIST */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-800 text-base">No Orders Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? `No orders matching "${searchQuery}"` : 'No orders in this status category.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-3 text-xs text-blue-600 font-bold hover:underline inline-block"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map(order => {
            const isConfirmed = order.status === 'Confirmed';
            const isPacking = order.status === 'Packing';
            const isOutForDelivery = order.status === 'Out for Delivery' || order.status === 'Shipped';
            const isDelivered = order.status === 'Delivered';
            const isCancelled = order.status === 'Cancelled';

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border-2 transition shadow-xs overflow-hidden ${
                  isConfirmed 
                    ? 'border-amber-300 ring-1 ring-amber-100' 
                    : isDelivered 
                    ? 'border-emerald-200' 
                    : isCancelled 
                    ? 'border-rose-200 opacity-75' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                
                {/* Order Top Ribbon */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                  
                  {/* Order ID & Time */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs ${
                      isDelivered ? 'bg-emerald-600' : isConfirmed ? 'bg-amber-500' : 'bg-blue-600'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-mono font-black text-slate-900 text-sm">
                          #{order.id}
                        </strong>
                        <button
                          onClick={() => handleCopyOrderId(order.id)}
                          className="text-slate-400 hover:text-blue-600 transition p-0.5"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Placed: {order.date || 'Today'} &bull; Delivery: {order.deliveryDate || 'Expected in 2 Days'}
                      </span>
                    </div>
                  </div>

                  {/* COD Cash Highlight & Status Badge */}
                  <div className="flex items-center gap-2">
                    
                    {/* Big Prominent COD Amount Badge */}
                    <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">COD Cash:</span>
                      <strong className="text-sm sm:text-base font-black text-emerald-950">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    {/* Status Pill */}
                    <span className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 uppercase tracking-wider ${
                      isDelivered 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : isConfirmed 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' 
                        : isPacking 
                        ? 'bg-purple-100 text-purple-900 border-purple-300' 
                        : isCancelled 
                        ? 'bg-rose-100 text-rose-900 border-rose-300' 
                        : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    }`}>
                      {order.status || 'Confirmed'}
                    </span>

                  </div>

                </div>

                {/* Main Card Body (2 Columns: Items vs Customer/Shipping) */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                  
                  {/* Left Column: Items to Pack & Dispatch (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Items Checklist ({order.items?.length || 0})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Verify size before dispatching
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/80 items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-white" 
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {item.brand || 'RatuMart'}
                              </span>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                {item.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                {/* Big highlighted size badge so no packer makes a mistake */}
                                <span className="bg-purple-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-2xs">
                                  Size: {item.selectedSize || 'Free'}
                                </span>
                                {item.selectedColor && (
                                  <span className="text-slate-600 text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                                    Color: {item.selectedColor}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-2">
                            <span className="font-black text-slate-900 text-sm block">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <span className="text-slate-500 text-[11px] font-bold">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Customer & Delivery Details (5 cols) */}
                  <div className="lg:col-span-5 bg-blue-50/40 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between space-y-3">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          Delivery Address
                        </span>
                        {order.address?.distanceKm !== undefined && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            📍 {order.address.distanceKm} KM Hub Distance
                          </span>
                        )}
                      </div>

                      {/* Customer Name & Phone */}
                      <div>
                        <strong className="text-sm font-black text-slate-900 block">
                          {order.address?.name || 'Customer'}
                        </strong>
                        <p className="text-slate-700 font-bold text-xs mt-0.5">
                          📞 {order.address?.phone}
                        </p>
                      </div>

                      {/* Full Street, Landmark, City & Pincode */}
                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-0.5 leading-relaxed">
                        <p className="font-semibold">{order.address?.street}</p>
                        {order.address?.landmark && (
                          <p className="text-slate-500 text-[11px]">
                            <strong>Landmark:</strong> {order.address.landmark}
                          </p>
                        )}
                        <p className="text-slate-600 font-medium">
                          {order.address?.city || 'Ranchi'}, {order.address?.state || 'Jharkhand'} - <strong>{order.address?.pincode || '835222'}</strong>
                        </p>
                      </div>

                      {/* 1-Tap Communication & Map Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        
                        {/* 1-Tap Call */}
                        <a
                          href={`tel:${order.address?.phone}`}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-2xs active:scale-95"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Customer</span>
                        </a>

                        {/* 1-Tap WhatsApp to Customer */}
                        <button
                          type="button"
                          onClick={() => openWhatsAppCustomer(order)}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#25D366] hover:bg-emerald-600 text-white font-bold rounded-xl transition text-xs shadow-2xs active:scale-95 cursor-pointer"
                          title="Send WhatsApp update to customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                      </div>

                      {/* Share with Delivery Rider & Google Maps */}
                      <div className="space-y-1.5 pt-1">
                        
                        {/* Send task to Delivery Boy on WhatsApp */}
                        <button
                          type="button"
                          onClick={() => shareWithDeliveryRider(order)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition text-xs shadow-xs active:scale-95 cursor-pointer"
                          title="Send complete delivery address, items & cash to rider"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Send Task to Delivery Boy (WhatsApp)</span>
                        </button>

                        {/* Google Maps Turn-by-Turn Link */}
                        {order.address?.lat && order.address?.lng && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.address.lat},${order.address.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 font-bold rounded-xl transition text-[11px]"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Open Navigation (Google Maps)</span>
                          </a>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom Action Footer: 1-Click Status Progression + Print Slip + Delete */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Left: 1-Click Status Flow Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Quick Action:</span>
                    
                    {isConfirmed && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Packing')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>📦 Mark as Packing</span>
                      </button>
                    )}

                    {isPacking && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>🚚 Out for Delivery</span>
                      </button>
                    )}

                    {isOutForDelivery && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✅ Mark Delivered (Cash Collected)</span>
                      </button>
                    )}

                    {/* Status Dropdown Override */}
                    <div className="relative">
                      <select
                        value={order.status || 'Confirmed'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs font-bold pl-2.5 pr-6 py-1.5 rounded-xl border border-slate-300 bg-white shadow-2xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        {statuses.map(st => (
                          <option key={st.label} value={st.label}>{st.label}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Right: Print Invoice & Delete Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintingOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs transition shadow-2xs active:scale-95 cursor-pointer"
                      title="Print Dispatch & Delivery Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Print Slip / Bill</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete order #${order.id}? This cannot be undone.`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition shadow-2xs"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 4. PRINTABLE DELIVERY SLIP & INVOICE MODAL (Parchi) */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-[#2874f0] text-white px-5 py-3.5 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-sm sm:text-base">Delivery Slip / Invoice (Parchi)</h3>
              </div>
              <button 
                onClick={() => setPrintingOrder(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 text-slate-900 font-sans space-y-4" id="printable-order-slip">
              
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-3">
                <h2 className="text-2xl font-black italic tracking-tight text-blue-900">
                  Ratu<span className="text-yellow-500">Mart</span>
                </h2>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Dandai Phutaltoli, Ratu, Ranchi - 835222</p>
                <p className="text-[11px] text-slate-500">Customer Helpline: +91 8050260000</p>
                <span className="inline-block mt-2 bg-slate-900 text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-widest">
                  COD Dispatch Invoice Slip
                </span>
              </div>

              {/* Order & Customer Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID:</span>
                  <strong className="font-mono text-sm font-black text-blue-900">#{printingOrder.id}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Date:</span>
                  <strong>{printingOrder.date || 'Today'}</strong>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer &amp; Address:</span>
                  <strong className="text-slate-900 block text-sm">{printingOrder.address?.name}</strong>
                  <p className="text-slate-700 font-bold">📞 {printingOrder.address?.phone}</p>
                  <p className="text-slate-600 mt-0.5">
                    {printingOrder.address?.street}
                    {printingOrder.address?.landmark ? `, Near: ${printingOrder.address.landmark}` : ''}
                  </p>
                  <p className="text-slate-600">
                    {printingOrder.address?.city} - <strong>{printingOrder.address?.pincode}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Ordered Items
                </span>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-bold text-[10px] uppercase text-left">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Size</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingOrder.items?.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-1.5 font-bold text-slate-800 pr-2">{it.name}</td>
                        <td className="py-1.5 text-center font-bold text-purple-700">{it.selectedSize || 'Free'}</td>
                        <td className="py-1.5 text-center font-bold">{it.quantity}</td>
                        <td className="py-1.5 text-right font-black">₹{it.price * it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total & COD Cash to Collect */}
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-3.5 rounded-2xl text-center space-y-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                  Amount to Collect from Customer:
                </span>
                <div className="text-3xl font-black text-emerald-950">
                  ₹{printingOrder.totalAmount?.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] font-bold text-emerald-700 block">
                  Payment Mode: Cash on Delivery (COD Only)
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1">
                  Customer Signature
                </div>
                <div className="border-t border-slate-300 pt-1">
                  Delivery Agent Signature
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
