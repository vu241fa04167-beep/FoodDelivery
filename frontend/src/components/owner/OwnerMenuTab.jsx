import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import formatPrice from '../../utils/formatPrice.js';

export default function OwnerMenuTab({ restaurantId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'Main Course', description: '', image: '', isVeg: true });

  const fetchMenu = async () => {
    try {
      const res = await api.get(`/restaurants/${restaurantId}/menu`);
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, [restaurantId]);

  const handleToggle = async (item) => {
    try {
      await api.patch(`/menu/${item._id}/availability`);
      setItems(items.map((it) => (it._id === item._id ? { ...it, isAvailable: !it.isAvailable } : it)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu/${itemId}`);
      setItems(items.filter((it) => it._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete dish');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: item.price, category: item.category, description: item.description || '', image: item.image || '', isVeg: item.isVeg });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || Number(form.price) <= 0) {
      alert('Valid name, category and positive price are required');
      return;
    }
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, form);
      } else {
        await api.post('/menu', form);
      }
      setShowForm(false);
      setEditingItem(null);
      setForm({ name: '', price: '', category: 'Main Course', description: '', image: '', isVeg: true });
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save menu item');
    }
  };

  if (loading) return <div className="text-center py-10 text-xs text-gray-500">Loading menu items...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded">
        <span className="text-xs font-bold text-gray-800">Total Items: {items.length}</span>
        <button type="button" onClick={() => { setEditingItem(null); setShowForm(!showForm); }} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-xs">
          {showForm ? 'Cancel' : '+ Add New Dish'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded p-4 space-y-3 text-xs">
          <h4 className="font-bold text-gray-800 uppercase">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="font-semibold text-gray-700">Dish Name *</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" /></div>
            <div><label className="font-semibold text-gray-700">Price (₹) *</label><input type="number" min={1} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" /></div>
            <div><label className="font-semibold text-gray-700">Category *</label><input type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" /></div>
            <div>
              <label className="font-semibold text-gray-700">Food Type</label>
              <select value={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.value === 'true' })} className="w-full mt-1 px-2.5 py-1.5 border rounded">
                <option value="true">Pure Veg</option>
                <option value="false">Non-Veg</option>
              </select>
            </div>
          </div>
          <div><label className="font-semibold text-gray-700">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" /></div>
          <div><label className="font-semibold text-gray-700">Image URL</label><input type="url" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full mt-1 px-2.5 py-1.5 border rounded" /></div>
          <button type="submit" className="px-4 py-1.5 bg-primary text-white font-bold rounded">{editingItem ? 'Update Dish' : 'Save Dish'}</button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {items.map((it) => (
          <div key={it._id} className="p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${it.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              <div>
                <p className="font-bold text-gray-900">{it.name} <span className="text-gray-400 font-normal">({it.category})</span></p>
                <p className="text-gray-500 font-semibold">{formatPrice(it.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleToggle(it)} className={`px-2 py-0.5 rounded font-bold text-[11px] ${it.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {it.isAvailable ? 'In Stock' : 'Sold Out'}
              </button>
              <button type="button" onClick={() => handleEdit(it)} className="text-primary font-bold hover:underline">Edit</button>
              <button type="button" onClick={() => handleDelete(it._id)} className="text-red-600 font-bold hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

