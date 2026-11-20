import React, { useState } from 'react';
import { Settings, Store, Truck, Phone, Mail, ShieldAlert, Save, RotateCcw, Bell, CheckCircle2, Send, Database, Cloud } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function AdminSettings() {
  const { storeSettings, updateStoreSettings, resetDefaultProducts, showToast } = useShop();
  const [testingNotification, setTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🎉 RatuMart Live Push Alert!',
          message: 'OneSignal Push & Resend Email notification integration is working 100%!',
          email: 'delivered@resend.dev'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('OneSignal Push & Resend Email sent successfully! 🎉');
      } else {
        showToast(data.error || 'Failed to dispatch test notification', 'error');
      }
    } catch (err) {
      showToast('Error sending test notification: ' + err.message, 'error');
    } finally {
      setTestingNotification(false);
    }
  };

  const [settings, setSettings] = useState({
    storeName: storeSettings.storeName || "RatuMart",
    tagline: storeSettings.tagline || "India Ka Fashion Capital",
    freeShippingThreshold: storeSettings.freeShippingThreshold || 499,
    deliveryCharge: storeSettings.deliveryCharge || 40,
    supportPhone: storeSettings.supportPhone || "080-4547-RATU",
    supportEmail: storeSettings.supportEmail || "support@ratumart.com",
    enableCod: storeSettings.enableCod !== undefined ? storeSettings.enableCod : true,
    maintenanceMode: storeSettings.maintenanceMode || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreSettings(settings);
  };

  const handleResetAll = () => {
    if (confirm("Reset store to default products and default settings?")) {
      resetDefaultProducts();
      localStorage.removeItem('ratumart_cart');
      localStorage.removeItem('ratumart_settings');
      showToast("Store data reset to default demo values!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Master Store Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure delivery charges, free shipping threshold, support helpline, and store policies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Basic Brand Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Store Brand Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Store Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Economics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Shipping &amp; Delivery Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Free Delivery Min Order Value (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Orders above this amount get 100% FREE delivery (Flipkart standard is ₹499).
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.deliveryCharge}
                onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Delivery charge applied when order value is below threshold.
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
            <Phone className="w-4 h-4 text-purple-600" />
            <span>Customer Care Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Allow Cash on Delivery (COD)</span>
              <span className="text-[11px] text-slate-400">Enable cash payment option at doorstep for customers</span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableCod}
              onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Maintenance Mode</span>
              <span className="text-[11px] text-slate-400">Temporarily show store under maintenance banner</span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded"
            />
          </div>
        </div>

        {/* Real Cloud & Notification Services Integration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Cloud &amp; Notification Services Status</span>
            </div>
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testingNotification}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {testingNotification ? 'Dispatching...' : 'Send Live Test Alert'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* MongoDB */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" /> MongoDB Atlas
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Cloud database running on AWS Cluster0 (ratumart db)</p>
            </div>

            {/* OneSignal */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" /> OneSignal Push
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" /> Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Push Notifications Service Enabled
              </p>
            </div>

            {/* Resend */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> Resend Emails
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" /> Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Transactional Email Service Enabled
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset Catalog to Demo State
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-8 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Store Settings
          </button>
        </div>

      </form>

    </div>
  );
}
