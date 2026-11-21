import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Phone, Mail, MapPin, MessageCircle, Trash2, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminCustomers() {
  const { customers, showToast } = useShop();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.phone || '').includes(search) || 
    (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Customer &amp; Shopper Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real registered customer profiles and shoppers synced with MongoDB database.
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

      {/* Customers Cards Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {search ? 'No matching customers found' : 'No customers registered yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {search 
              ? 'Try searching with a different name, phone number, or city.'
              : 'Jab bhi koi naya customer RatuMart par login karega ya order place karega, uska profile yahan real database se automatically display hoga.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cust) => {
            const cleanPhone = (cust.phone || '').replace(/\D/g, '').slice(-10);
            return (
              <div key={cust.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-black text-base flex items-center justify-center flex-shrink-0">
                        {(cust.name || 'U').charAt(0).toUpperCase()}
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

                    <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Active User
                    </span>
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
                      <span className="truncate">{cust.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-blue-600 font-extrabold">{cust.totalOrders} orders</span>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Namaste ${cust.name} ji! RatuMart Dandai Phutaltoli Hub se bol rahe hain.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
