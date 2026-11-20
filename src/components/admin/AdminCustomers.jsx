import React, { useState } from 'react';
import { Users, Coins, Plus, Search, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminCustomers() {
  const { customers, updateCustomerCoins, showToast } = useShop();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer &amp; Shopper Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View registered customers, monitor order counts, and reward Ratu SuperCoins.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cust) => (
          <div key={cust.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
            
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-black text-base flex items-center justify-center flex-shrink-0">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {cust.name}
                      {cust.status === 'VIP' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                          VIP
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">Joined on {cust.joined}</span>
                  </div>
                </div>

                {/* SuperCoins Badge */}
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-yellow-200">
                    <Coins className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {cust.superCoins} Coins
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{cust.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{cust.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Orders:</span>
                  <span className="text-blue-600 font-extrabold">{cust.totalOrders} orders</span>
                </div>
              </div>
            </div>

            {/* Gift SuperCoins button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Reward Customer:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateCustomerCoins(cust.id, 50)}
                  className="bg-yellow-100 hover:bg-yellow-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg transition text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 50 Coins
                </button>
                <button
                  onClick={() => updateCustomerCoins(cust.id, 100)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black px-2.5 py-1 rounded-lg transition text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 100 Coins
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
