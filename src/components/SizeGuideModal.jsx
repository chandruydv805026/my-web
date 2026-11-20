import React, { useState } from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function SizeGuideModal() {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'
  const [tab, setTab] = useState('men'); // 'men' | 'women' | 'kids'

  if (!isSizeGuideOpen) return null;

  const sizeData = {
    men: [
      { size: "S (38)", chestIn: "38-39", chestCm: "96-99", waistIn: "30-32", waistCm: "76-81", lengthIn: "27.5", lengthCm: "70" },
      { size: "M (40)", chestIn: "40-41", chestCm: "101-104", waistIn: "32-34", waistCm: "81-86", lengthIn: "28.5", lengthCm: "72" },
      { size: "L (42)", chestIn: "42-43", chestCm: "106-109", waistIn: "34-36", waistCm: "86-91", lengthIn: "29.5", lengthCm: "75" },
      { size: "XL (44)", chestIn: "44-46", chestCm: "111-117", waistIn: "36-38", waistCm: "91-96", lengthIn: "30.5", lengthCm: "77" },
      { size: "XXL (46)", chestIn: "47-49", chestCm: "119-124", waistIn: "38-40", waistCm: "96-101", lengthIn: "31.5", lengthCm: "80" },
    ],
    women: [
      { size: "XS (32)", chestIn: "32-33", chestCm: "81-84", waistIn: "26-27", waistCm: "66-68", hipIn: "35-36", hipCm: "89-91" },
      { size: "S (34)", chestIn: "34-35", chestCm: "86-89", waistIn: "28-29", waistCm: "71-74", hipIn: "37-38", hipCm: "94-96" },
      { size: "M (36)", chestIn: "36-37", chestCm: "91-94", waistIn: "30-31", waistCm: "76-79", hipIn: "39-40", hipCm: "99-102" },
      { size: "L (38)", chestIn: "38-40", chestCm: "96-102", waistIn: "32-34", waistCm: "81-86", hipIn: "41-43", hipCm: "104-109" },
      { size: "XL (40)", chestIn: "41-43", chestCm: "104-109", waistIn: "35-37", waistCm: "89-94", hipIn: "44-46", hipCm: "112-117" },
    ],
    kids: [
      { size: "2-3 Yrs", heightIn: "36-38", heightCm: "92-98", chestIn: "21", chestCm: "53", waistIn: "20.5", waistCm: "52" },
      { size: "4-5 Yrs", heightIn: "41-43", heightCm: "104-110", chestIn: "23", chestCm: "58", waistIn: "21.5", waistCm: "55" },
      { size: "6-7 Yrs", heightIn: "46-48", heightCm: "116-122", chestIn: "25", chestCm: "63", waistIn: "22.5", waistCm: "57" },
      { size: "8-9 Yrs", heightIn: "51-53", heightCm: "128-134", chestIn: "27", chestCm: "68", waistIn: "24", waistCm: "61" },
      { size: "10-12 Yrs", heightIn: "56-60", heightCm: "140-152", chestIn: "30", chestCm: "76", waistIn: "26", waistCm: "66" },
    ]
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">Standard Size Chart</h2>
          </div>

          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Unit Switcher */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
            {/* Category tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {['men', 'women', 'kids'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-md capitalize transition ${
                    tab === t ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}'s
                </button>
              ))}
            </div>

            {/* Unit toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
              <button
                onClick={() => setUnit('inches')}
                className={`px-2.5 py-1 rounded-md transition ${
                  unit === 'inches' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded-md transition ${
                  unit === 'cm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">{tab === 'kids' ? 'Height' : (tab === 'women' ? 'Bust' : 'Chest')} ({unit === 'inches' ? 'in' : 'cm'})</th>
                  <th className="p-2.5">Waist ({unit === 'inches' ? 'in' : 'cm'})</th>
                  {tab === 'women' && <th className="p-2.5">Hip ({unit === 'inches' ? 'in' : 'cm'})</th>}
                  {tab === 'men' && <th className="p-2.5">Length ({unit === 'inches' ? 'in' : 'cm'})</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sizeData[tab].map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition">
                    <td className="p-2.5 font-bold text-blue-600">{row.size}</td>
                    <td className="p-2.5">{unit === 'inches' ? (row.chestIn || row.heightIn) : (row.chestCm || row.heightCm)}</td>
                    <td className="p-2.5">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                    {tab === 'women' && <td className="p-2.5">{unit === 'inches' ? row.hipIn : row.hipCm}</td>}
                    {tab === 'men' && <td className="p-2.5">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measuring Tips */}
          <div className="mt-4 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
            <h4 className="font-bold text-blue-900">How to measure:</h4>
            <p>&bull; <strong>Chest/Bust:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            <p>&bull; <strong>Waist:</strong> Measure around your natural waistline, where your trousers usually sit.</p>
            <p>&bull; <strong>Tip:</strong> If you are between two sizes, we recommend ordering the larger size for a relaxed Indian fit.</p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="bg-blue-600 text-white font-bold text-xs py-2 px-5 rounded-lg shadow-sm hover:bg-blue-700 transition"
            >
              Got it, Close
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
