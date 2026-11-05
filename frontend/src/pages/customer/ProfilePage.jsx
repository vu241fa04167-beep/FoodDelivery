import React, { useState } from 'react';
import {
  UserRound,
  MapPin,
  Plus,
  Trash2,
  Check,
  Phone,
  Mail,
  ShieldCheck,
  Save
} from 'lucide-react';
import { api, setStoredAuth } from '../../services/api.js';

export default function ProfilePage({ auth, setAuth, onFlash }) {
  const user = auth?.user || {};
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [addresses, setAddresses] = useState(user.addresses || []);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: 'New York',
    state: 'NY',
    postalCode: '',
    phone: user.phone || '',
    isDefault: addresses.length === 0
  });

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await api('/profile', {
        method: 'PATCH',
        body: {
          name,
          phone,
          addresses
        }
      });
      const updatedAuth = { ...auth, user: res.user };
      setStoredAuth(updatedAuth);
      setAuth(updatedAuth);
      onFlash('Profile saved successfully');
    } catch (err) {
      onFlash(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.line1 || !newAddr.city) {
      return onFlash('Please provide a complete street address and city.');
    }

    let updatedList = [...addresses];
    if (newAddr.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(newAddr);
    setAddresses(updatedList);
    setIsAddingAddress(false);
    setNewAddr({
      label: 'Home',
      line1: '',
      line2: '',
      city: 'New York',
      state: 'NY',
      postalCode: '',
      phone: phone || '',
      isDefault: false
    });

    // Auto-save to backend
    try {
      const res = await api('/profile', {
        method: 'PATCH',
        body: { addresses: updatedList }
      });
      const updatedAuth = { ...auth, user: res.user };
      setStoredAuth(updatedAuth);
      setAuth(updatedAuth);
      onFlash('New address added to your profile');
    } catch (err) {
      onFlash(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (idx) => {
    const updatedList = addresses.filter((_, i) => i !== idx);
    setAddresses(updatedList);
    try {
      const res = await api('/profile', {
        method: 'PATCH',
        body: { addresses: updatedList }
      });
      const updatedAuth = { ...auth, user: res.user };
      setStoredAuth(updatedAuth);
      setAuth(updatedAuth);
      onFlash('Address removed');
    } catch (err) {
      onFlash(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (idx) => {
    const updatedList = addresses.map((a, i) => ({
      ...a,
      isDefault: i === idx
    }));
    setAddresses(updatedList);
    try {
      const res = await api('/profile', {
        method: 'PATCH',
        body: { addresses: updatedList }
      });
      const updatedAuth = { ...auth, user: res.user };
      setStoredAuth(updatedAuth);
      setAuth(updatedAuth);
      onFlash('Default address updated');
    } catch (err) {
      onFlash(err.message || 'Failed to update default address');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8 pb-28">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
          ACCOUNT & PREFERENCES
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d] mt-1">
          Profile & Saved Addresses
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#66706b]">
          Manage your contact information and saved delivery destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left: Personal Details Form (Col 5) */}
        <div className="md:col-span-5 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[#e7e9e6] bg-white p-5 sm:p-6 shadow-2xs space-y-3.5">
            <h3 className="font-serif text-base font-bold text-[#17211d] pb-2 border-b border-[#e7e9e6]">
              Personal Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">Email Address</label>
              <input
                disabled
                type="email"
                value={user.email || ''}
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#f7f6f1] p-2.5 text-xs text-[#66706b] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#66706b] mt-0.5 block">Email cannot be changed</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 010-1849"
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">Account Role</label>
              <span className="inline-block rounded-lg bg-[#e6efe8] border border-[#195c45]/20 px-2.5 py-0.5 text-xs font-bold text-[#195c45] capitalize">
                {user.role || 'customer'}
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#195c45] py-2.5 text-xs font-semibold text-white hover:bg-[#124534] transition shadow-2xs disabled:opacity-60"
            >
              <Save size={14} />
              <span>{saving ? 'Saving…' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right: Saved Delivery Addresses (Col 7) */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e9e6]">
              <h3 className="font-serif text-base font-bold text-[#17211d]">
                Saved Addresses
              </h3>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#195c45] hover:underline"
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {addresses.length === 0 && !isAddingAddress && (
                <p className="text-xs text-[#66706b] italic py-4 text-center">
                  No saved addresses yet. Add one to enable 1-click checkout.
                </p>
              )}

              {addresses.map((addr, idx) => (
                <div
                  key={addr._id || idx}
                  className={`rounded-2xl border p-3.5 transition ${
                    addr.isDefault
                      ? 'border-[#195c45] bg-[#e6efe8]/40'
                      : 'border-[#e7e9e6] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#17211d]">
                          {addr.label || 'Home'}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-[#195c45] px-2 py-0.2 text-[10px] font-bold text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#17211d] mt-1">{addr.line1}</p>
                      {addr.line2 && <p className="text-xs text-[#66706b]">{addr.line2}</p>}
                      <p className="text-xs text-[#66706b]">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      {addr.phone && (
                        <p className="text-[11px] text-[#66706b] mt-0.5">📞 {addr.phone}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(idx)}
                          className="text-xs font-semibold text-[#66706b] hover:text-[#195c45]"
                          title="Set as default"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="p-1.5 text-[#66706b] hover:text-red-600"
                        title="Delete address"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="rounded-2xl border border-[#e7e9e6] bg-[#f7f6f1] p-4 space-y-3 mt-4 animate-fade-in">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-[#17211d]">Add New Address</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-[#66706b] hover:text-[#17211d]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[#17211d] font-bold mb-1">Label</label>
                    <input
                      type="text"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      placeholder="Home, Office..."
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17211d] font-bold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#17211d] font-bold mb-1 text-xs">Street Address *</label>
                  <input
                    required
                    type="text"
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    placeholder="220 W 14th Street, Apt 4B"
                    className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[#17211d] font-bold mb-1">City *</label>
                    <input
                      required
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17211d] font-bold mb-1">State</label>
                    <input
                      type="text"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17211d] font-bold mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs outline-none focus:border-[#195c45]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#17211d] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="accent-[#195c45]"
                  />
                  <span>Set as my default delivery address</span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#195c45] py-2 text-xs font-semibold text-white hover:bg-[#124534] transition shadow-2xs"
                >
                  Save Address
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
