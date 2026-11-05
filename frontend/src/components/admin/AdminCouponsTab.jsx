import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import formatPrice from '../../utils/formatPrice.js';
import formatDate from '../../utils/formatDate.js';

export default function AdminCouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({ code: '', discountPercent: 20, maxDiscount: 100, minOrder: 199, expiryDate: '', isActive: true });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleEdit = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      discountPercent: c.discountPercent,
      maxDiscount: c.maxDiscount,
      minOrder: c.minOrder,
      expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '',
      isActive: c.isActive
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || Number(form.discountPercent) <= 0) {
      alert('Valid code and discount percent are required');
      return;
    }
    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, form);
      } else {
        await api.post('/admin/coupons', form);
      }
      setShowForm(false);
      setEditingCoupon(null);
      setForm({ code: '', discountPercent: 20, maxDiscount: 100, minOrder: 199, expiryDate: '', isActive: true });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  if (loading) return <div className="text-center py-10 text-xs text-gray-500">Loading coupons...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded">
        <span className="text-xs font-bold text-gray-800">Coupons ({coupons.length})</span>
        <button type="button" onClick={() => { setEditingCoupon(null); setShowForm(!showForm); }} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-xs">
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-4 space-y-3 text-xs">
          <h4 className="font-bold text-gray-800 uppercase">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-gray-700">Code *</label>
              <input type="text" required disabled={!!editingCoupon} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full mt-1 px-2.5 py-1.5 border rounded uppercase" />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Discount (%) *</label>
              <input type="number" min={1} max={100} required value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} className="w-full mt-1 px-2.5 py-1.5 border rounded" />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Max Discount (₹)</label>
              <input type="number" min={10} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className="w-full mt-1 px-2.5 py-1.5 border rounded" />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Min Order (₹)</label>
              <input type="number" min={0} value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="w-full mt-1 px-2.5 py-1.5 border rounded" />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} id="activeCheck" className="accent-primary" />
              <label htmlFor="activeCheck" className="font-semibold text-gray-700 cursor-pointer">Active</label>
            </div>
          </div>
          <button type="submit" className="px-4 py-1.5 bg-primary text-white font-bold rounded">{editingCoupon ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100 shadow-xs">
        {coupons.map((c) => (
          <div key={c._id} className="p-3 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 tracking-wider text-sm">{c.code}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5">{c.discountPercent}% OFF • Max {formatPrice(c.maxDiscount)} • Min order {formatPrice(c.minOrder)}</p>
              {c.expiryDate && <p className="text-gray-400 text-[11px]">Expires: {formatDate(c.expiryDate)}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleEdit(c)} className="text-primary font-bold hover:underline">Edit</button>
              <button type="button" onClick={() => handleDelete(c._id)} className="text-red-600 font-bold hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

