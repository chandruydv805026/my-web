import React, { useState } from 'react';
import { Megaphone, Clock, CreditCard, Sparkles, Check, Save } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminMarketing() {
  const { 
    announcementText, 
    setAnnouncementText, 
    storeSettings, 
    updateStoreSettings, 
    showToast 
  } = useShop();

  const [text, setText] = useState(announcementText);
  const [timerHours, setTimerHours] = useState(storeSettings.dealTimerHours || 4);

  const handleSave = (e) => {
    e.preventDefault();
    setAnnouncementText(text);
    updateStoreSettings({ dealTimerHours: Number(timerHours) });
    showToast('Banner & Deal of the Day settings saved!');
  };

  return (
    <div className="space-y-5">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Marketing &amp; Banner Controller</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize storefront announcement tickers, Deal of the Day timers, and partner bank offers.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Announcement Bar Editor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
            <Megaphone className="w-4 h-4 text-blue-600" />
            <span>Top Notification Bar Ticker</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Announcement Text</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Grand Fashion Days: Up to 80% Off on Indian Ethnic & Streetwear!"
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-slate-800"
            />
          </div>

          {/* Live Preview of Header Strip */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Customer Preview:
            </span>
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs p-2.5 rounded-xl flex items-center gap-2">
              <span className="bg-yellow-400 text-blue-900 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                Festival Special
              </span>
              <span className="truncate">{text}</span>
            </div>
          </div>
        </div>

        {/* Deal of the Day Timer Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Flash Deal &amp; Countdown Settings</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Deal Countdown Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="48"
              value={timerHours}
              onChange={(e) => setTimerHours(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-bold text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Storefront banner par countdown timer is time period ke anusar chalega.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">💡 Pro Tip for Higher Sales:</span>
            <p>
              Short 3-4 hours countdown timers create a Flipkart-style FOMO effect, increasing checkout conversion by up to 28%!
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Marketing Settings
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
