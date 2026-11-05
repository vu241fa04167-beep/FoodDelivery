import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import AddressForm from './AddressForm.jsx';

export default function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const toList = (d) => (Array.isArray(d) ? d : (d?.addresses || []));

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses');
      setAddresses(toList(res.data));
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to load addresses', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (formData) => {
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      if (editingAddress) {
        const res = await api.put(`/auth/addresses/${editingAddress._id}`, formData);
        setAddresses(toList(res.data));
        setMessage({ text: 'Address updated successfully', type: 'success' });
      } else {
        const res = await api.post('/auth/addresses', formData);
        setAddresses(toList(res.data));
        setMessage({ text: 'Address added successfully', type: 'success' });
      }
      setEditingAddress(null);
      setIsAdding(false);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save address', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/auth/addresses/${id}`);
      setAddresses(toList(res.data));
      setMessage({ text: 'Address deleted successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete address', type: 'error' });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.patch(`/auth/addresses/${id}/default`);
      setAddresses(toList(res.data));
      setMessage({ text: 'Default address updated', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to set default', type: 'error' });
    }
  };

  if (loading) return <p className="text-sm text-gray-500 py-4">Loading saved addresses...</p>;

  return (
    <div className="space-y-4">
      {message.text && (
        <div className={`p-2.5 rounded text-xs ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {(isAdding || editingAddress) ? (
        <div className="border border-gray-200 rounded p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm mb-3">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            initialData={editingAddress || {}}
            onSubmit={handleSave}
            onCancel={() => { setIsAdding(false); setEditingAddress(null); }}
            submitLabel={editingAddress ? 'Update Address' : 'Add Address'}
            loading={submitting}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{addresses.length} / 5 addresses saved</span>
            {addresses.length < 5 && (
              <button
                type="button"
                onClick={() => { setIsAdding(true); setMessage({ text: '', type: '' }); }}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-hover"
              >
                + Add New Address
              </button>
            )}
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border rounded border-dashed">No saved addresses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div key={addr._id} className="border border-gray-200 rounded p-3 text-xs flex flex-col justify-between hover:border-gray-300">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded text-[11px] uppercase">{addr.label}</span>
                      {addr.isDefault && <span className="px-2 py-0.5 bg-primary text-white font-bold rounded text-[11px]">Default</span>}
                    </div>
                    <p className="font-bold text-gray-800">{addr.fullName}</p>
                    <p className="text-gray-600">{addr.phone}</p>
                    <p className="text-gray-600 mt-1">{addr.line1}, {addr.area} - {addr.pincode}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => { setEditingAddress(addr); setIsAdding(false); }} className="text-primary hover:underline font-semibold">Edit</button>
                    <button type="button" onClick={() => handleDelete(addr._id)} className="text-red-500 hover:underline font-semibold">Delete</button>
                    {!addr.isDefault && (
                      <button type="button" onClick={() => handleSetDefault(addr._id)} className="text-gray-500 hover:text-gray-700 ml-auto font-medium">Set as default</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

