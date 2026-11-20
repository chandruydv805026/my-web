import React from 'react';
import { Store, HelpCircle, Gift, HelpCircle as HelpIcon, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-slate-300 text-xs mt-12 border-t border-slate-800">
      {/* 4-column main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-10 border-b border-slate-700/80">
          
          {/* Col 1 */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">ABOUT</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:underline">Contact Us</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">RatuMart Stories</a></li>
              <li><a href="#" className="hover:underline">Press Releases</a></li>
              <li><a href="#" className="hover:underline">Corporate Information</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">HELP</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:underline">Payments</a></li>
              <li><a href="#" className="hover:underline">Shipping</a></li>
              <li><a href="#" className="hover:underline">Cancellation &amp; Returns</a></li>
              <li><a href="#" className="hover:underline">FAQ &amp; Size Guide</a></li>
              <li><a href="#" className="hover:underline">Report Infringement</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">CONSUMER POLICY</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:underline">Cancellation &amp; Returns</a></li>
              <li><a href="#" className="hover:underline">Terms Of Use</a></li>
              <li><a href="#" className="hover:underline">Security</a></li>
              <li><a href="#" className="hover:underline">Privacy</a></li>
              <li><a href="#" className="hover:underline">Sitemap</a></li>
              <li><a href="#" className="hover:underline">Grievance Redressal</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">SOCIAL</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter / X</a></li>
              <li><a href="#" className="hover:underline">YouTube</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
            </ul>
          </div>

          {/* Col 5: Mail Us */}
          <div className="border-t md:border-t-0 md:border-l border-slate-700/80 md:pl-6 pt-6 md:pt-0">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Mail Us:</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              RatuMart Fashion Internet Private Limited,<br />
              Buildings Alyssa, Begonia &amp; Clove Embassy Tech Village,<br />
              Outer Ring Road, Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>

          {/* Col 6: Registered Office */}
          <div className="border-t md:border-t-0 md:border-l border-slate-700/80 md:pl-6 pt-6 md:pt-0">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Registered Office:</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              RatuMart Fashion Retail Complex,<br />
              Main Road, Ratu Chawk,<br />
              Ranchi - 835222, Jharkhand, India<br />
              CIN: U51109JH2026PTC04921<br />
              Telephone: <a href="tel:18002029898" className="text-blue-400 hover:underline">080-4547-RATU</a>
            </p>
          </div>

        </div>

        {/* Bottom Bar Flipkart Style */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-6 text-white font-medium">
            <span className="flex items-center gap-1.5 hover:text-yellow-300 cursor-pointer transition">
              <Store className="w-3.5 h-3.5 text-yellow-400" />
              Become a Seller
            </span>
            <span className="flex items-center gap-1.5 hover:text-yellow-300 cursor-pointer transition">
              <Gift className="w-3.5 h-3.5 text-yellow-400" />
              Gift Cards
            </span>
            <span className="flex items-center gap-1.5 hover:text-yellow-300 cursor-pointer transition">
              <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
              Help Center
            </span>
          </div>

          <div>
            &copy; 2026-2027 RatuMart.com. All Rights Reserved.
          </div>

          {/* Payment Gateways */}
          <div className="flex items-center gap-2">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">VISA</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">Mastercard</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">RuPay</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-yellow-300">UPI</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
