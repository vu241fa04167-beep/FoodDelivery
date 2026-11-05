import React, { useState } from 'react';
import api from '../../api/axios.js';

export default function RestaurantCreateForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    cuisine: '',
    area: 'Koramangala',
    address: '',
    deliveryTime: '30-40 mins',
    deliveryFee: 35,
    minOrder: 150,
    priceForTwo: 300,
    description: '',
    image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cuisine || !form.area || !form.address) {
      setError('Name, cuisine, area and address are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/restaurants', form);
      onCreated(res.data.restaurant);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded p-6 shadow-xs">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Register Your Restaurant</h2>
      <p className="text-xs text-gray-500 mb-4">Your restaurant will start with status "pending" until approved by the admin.</p>
      {error && <p className="p-2 mb-3 bg-red-50 text-red-600 border border-red-200 rounded text-xs">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="font-semibold text-gray-700">Restaurant Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700">Cuisine(s) *</label>
            <input type="text" placeholder="e.g. South Indian, Biryani" required value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Area *</label>
            <input type="text" placeholder="e.g. Indiranagar" required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="font-semibold text-gray-700">Full Address *</label>
          <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-gray-700">Delivery Time</label>
            <input type="text" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Price for Two (₹)</label>
            <input type="number" min={50} value={form.priceForTwo} onChange={(e) => setForm({ ...form, priceForTwo: Number(e.target.value) })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Image URL</label>
            <input type="url" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full mt-1 px-3 py-1.5 border rounded outline-none focus:border-primary" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-2 py-2 bg-primary text-white font-bold rounded hover:opacity-90 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}

