import React, { useState } from 'react';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, 
  Phone, Trash2, Printer, Search, Filter, ShieldCheck, Navigation 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, showToast } = useShop();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = [
    { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Packing", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Shipped", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200" }
  ];

  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase();
    const matchSearch = ord.id.toLowerCase().includes(q) || 
      (ord.address?.name || '').toLowerCase().includes(q) ||
      (ord.address?.phone || '').includes(q);
    const matchStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Fulfillment Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer orders, update delivery status (Packing &rarr; Shipped &rarr; Delivered), and review delivery addresses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          {['all', 'Confirmed', 'Packing', 'Shipped', 'Delivered'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition whitespace-nowrap ${
                statusFilter === s 
                  ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No Orders Found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or search term.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-blue-300 transition space-y-4">
              
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-blue-600 text-sm block">{order.id}</span>
                    <span className="text-[11px] text-slate-400">Placed on {order.date} &bull; Paid via {order.paymentMethod}</span>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold hidden sm:inline">Change Status:</span>
                  <select
                    value={order.status || 'Confirmed'}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white shadow-xs focus:ring-1 focus:ring-blue-600"
                  >
                    {statuses.map(st => (
                      <option key={st.label} value={st.label}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Middle Section: Items + Delivery Address */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                
                {/* Items in this order (7 cols) */}
                <div className="md:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Items to Dispatch ({order.items?.length || 0})
                  </span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.brand}</span>
                        <h5 className="font-bold text-slate-900 truncate">{item.name}</h5>
                        <p className="text-slate-500 text-[11px] mt-0.5">Size: <strong>{item.selectedSize}</strong> &bull; Color: {item.selectedColor}</p>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <span className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        <span className="text-slate-500 text-[11px]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address (5 cols) */}
                <div className="md:col-span-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Delivery Destination
                    </span>
                    <strong className="text-slate-900 text-xs block">{order.address?.name}</strong>
                    <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                      {order.address?.street}, {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
                    </p>
                    <p className="text-blue-700 font-semibold text-xs mt-1.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.address?.phone}
                    </p>

                    {/* Exact GPS Navigation Link */}
                    {order.address?.lat && order.address?.lng ? (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            📍 {order.address.distanceKm || 'Within 5'} KM away
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {Number(order.address.lat).toFixed(4)}, {Number(order.address.lng).toFixed(4)}
                          </span>
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.address.lat},${order.address.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
                          title="Open turn-by-turn navigation in Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps Navigation</span>
                        </a>
                      </div>
                    ) : (
                      <div className="mt-2 text-[10px] text-slate-400 italic">
                        Standard Address (Manual Route)
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Amount</span>
                      <span className="text-base font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Printing dispatch label for ${order.id}...`)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border rounded-lg transition"
                        title="Print Shipping Label"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete order ${order.id}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
