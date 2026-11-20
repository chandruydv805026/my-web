import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, ShieldCheck, 
  RotateCcw, Sparkles, X, Check, AlertCircle, Image as ImageIcon, 
  Upload, Camera, RefreshCw 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CATEGORIES } from '../../data/products';

export default function AdminProducts() {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetDefaultProducts, 
    uploadPhoto,
    showToast 
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all'); // 'all', 'kids', 'men', 'women'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const initialForm = {
    name: '',
    brand: 'Ratu Mart',
    category: 'kids',
    audience: 'kids', // 'kids' (Kids Wear), 'men' (Men's Fashion), 'women' (Women's Fashion)
    price: '',
    originalPrice: '',
    stockLeft: 25,
    sizes: 'S, M, L, XL',
    colors: 'Red, Blue, Black',
    fabric: '100% Pure Cotton',
    fit: 'Regular Fit',
    washCare: 'Machine Wash',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=700&auto=format&fit=crop&q=80',
    assured: true,
    tag: 'Trending Arrival'
  };

  const [formData, setFormData] = useState(initialForm);

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const matchAudience = filterAudience === 'all' || p.audience === filterAudience;
    return matchSearch && matchCat && matchAudience;
  });

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      audience: product.audience || 'men',
      price: product.price,
      originalPrice: product.originalPrice || product.original_price,
      stockLeft: product.stockLeft || product.stock_left || 20,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
      fabric: product.fabric || '',
      fit: product.fit || '',
      washCare: product.washCare || product.wash_care || '',
      image: product.image,
      assured: product.assured,
      tag: product.tag || ''
    });
    setIsAddModalOpen(true);
  };

  // Handle Real Photo Upload from Phone/Computer
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    showToast('Uploading real clothing photo to server...');

    const uploadedUrl = await uploadPhoto(file);
    setIsUploading(false);

    if (uploadedUrl) {
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please enter clothing title and selling price");
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        audience: formData.audience,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        stockLeft: Number(formData.stockLeft),
        sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()) : formData.sizes,
        colors: typeof formData.colors === 'string' ? formData.colors.split(',').map(c => c.trim()) : formData.colors,
        fabric: formData.fabric,
        fit: formData.fit,
        washCare: formData.washCare,
        image: formData.image,
        assured: formData.assured,
        tag: formData.tag
      });
    } else {
      await addProduct(formData);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Inventory &amp; Clothes Catalog (SQLite Database)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage clothing catalog for Kids, Men &amp; Women and upload real product photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={resetDefaultProducts}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Refresh from database"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh DB
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Clothes (Photo Upload)
          </button>
        </div>
      </div>

      {/* Segment Quick Filter Pills (Kids, Men, Women) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mr-1">Section:</span>
        {[
          { id: 'all', label: 'All Clothes' },
          { id: 'kids', label: '🧒 Kids' },
          { id: 'men', label: '👔 Men' },
          { id: 'women', label: '👗 Women' }
        ].map(seg => (
          <button
            key={seg.id}
            onClick={() => setFilterAudience(seg.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition whitespace-nowrap active:scale-95 ${
              filterAudience === seg.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by cloth name, brand, fabric..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Outfit &amp; Photo</th>
                <th className="p-3">Segment</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Original MRP</th>
                <th className="p-3">Stock Left</th>
                <th className="p-3">Assured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-11 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200" 
                      />
                      <div className="min-w-0 max-w-[160px] sm:max-w-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {item.brand}
                        </span>
                        <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[10px] text-slate-500">{item.sizes?.join(', ')}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      item.audience === 'kids' 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : item.audience === 'women' 
                        ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {item.audience === 'kids' ? 'Kids' : item.audience === 'women' ? 'Women' : 'Men'}
                    </span>
                  </td>

                  <td className="p-3 font-black text-slate-900">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 text-slate-400 line-through">
                    ₹{(item.originalPrice || item.original_price)?.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      (item.stockLeft || item.stock_left || 20) < 10 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.stockLeft || item.stock_left || 20} pcs
                    </span>
                  </td>

                  <td className="p-3">
                    {item.assured ? (
                      <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200">
                        ★ Assured
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">No</span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Outfit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.name}" from database?`)) {
                            deleteProduct(item.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Outfit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Real Photo Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-4 sm:p-6 border border-slate-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingProduct ? 'Edit Outfit Details' : 'Add Naye Kapde (With Real Photo Upload)'}
                </h3>
                <p className="text-[11px] text-slate-400">This item will be saved directly to your live database.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              
              {/* Target Audience: Kids, Men, Women */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Audience / Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kids', label: '🧒 Kids' },
                    { id: 'men', label: '👔 Men' },
                    { id: 'women', label: '👗 Women' }
                  ].map(aud => (
                    <button
                      type="button"
                      key={aud.id}
                      onClick={() => setFormData({ ...formData, audience: aud.id })}
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center text-center ${
                        formData.audience === aud.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boys Party Suit, Banarasi Saree, Men Denim Jacket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Store Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium bg-white"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, MRP & Stock */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 799"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="e.g. 1999"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Left (Pcs)</label>
                  <input
                    type="number"
                    value={formData.stockLeft}
                    onChange={(e) => setFormData({ ...formData, stockLeft: e.target.value })}
                    placeholder="25"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Sizes and Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sizes (e.g. S, M, L or 2-3 Yrs)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Colors (e.g. Red, Blue, Black)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Red, Blue, Navy"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* REAL PHOTO UPLOAD BUTTON */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
                <label className="block text-blue-950 font-bold">
                  📸 Upload Real Photo of Your Clothes
                </label>
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Choose Photo from Phone / PC'}</span>
                  </button>

                  <span className="text-[11px] text-slate-500">or enter image URL below</span>
                </div>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 text-[11px] bg-white"
                />

                {formData.image && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={formData.image} alt="Preview" className="w-12 h-14 object-cover rounded-lg border border-slate-300 shadow-xs" />
                    <span className="text-[10px] text-emerald-700 font-bold">Photo ready to be published!</span>
                  </div>
                )}
              </div>

              {/* Assured Checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="assuredCheckbox"
                  checked={formData.assured}
                  onChange={(e) => setFormData({ ...formData, assured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="assuredCheckbox" className="font-bold text-slate-800 cursor-pointer">
                  Tag as "Ratu Assured" (Flipkart Quality Guarantee Badge)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Save to SQLite Database'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
