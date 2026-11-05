import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import AddressesTab from '../components/AddressesTab.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  // Personal form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [personalMsg, setPersonalMsg] = useState({ text: '', type: '' });
  const [personalLoading, setPersonalLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setPersonalMsg({ text: 'Name is required', type: 'error' });
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return setPersonalMsg({ text: 'Phone must be 10 digits', type: 'error' });
    }

    setPersonalLoading(true);
    setPersonalMsg({ text: '', type: '' });
    try {
      const res = await api.put('/auth/profile', { name: name.trim(), phone: phone.trim() });
      updateUser(res.data.user);
      setPersonalMsg({ text: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setPersonalMsg({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setPersonalLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) return setPasswordMsg({ text: 'Current password is required', type: 'error' });
    if (newPassword.length < 6) return setPasswordMsg({ text: 'New password must be at least 6 characters', type: 'error' });
    if (newPassword !== confirmPassword) return setPasswordMsg({ text: 'Passwords do not match', type: 'error' });

    setPasswordLoading(true);
    setPasswordMsg({ text: '', type: '' });
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordMsg({ text: res.data.message || 'Password changed successfully', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white/70 rounded-2xl my-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 text-sm font-semibold">
        {[
          { id: 'personal', label: 'Personal Details' },
          { id: 'addresses', label: 'Saved Addresses' },
          { id: 'password', label: 'Change Password' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'personal' && (
        <form onSubmit={handlePersonalSubmit} className="max-w-md space-y-4 text-xs">
          {personalMsg.text && (
            <div className={`p-2.5 rounded ${personalMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {personalMsg.text}
            </div>
          )}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email (Cannot be changed)</label>
            <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed text-sm" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Phone Number (10 digits)</label>
            <input type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 9876543210" className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-primary text-sm" />
          </div>
          <button type="submit" disabled={personalLoading} className="px-5 py-2 bg-primary text-white font-bold rounded hover:opacity-90 disabled:opacity-50 text-sm">
            {personalLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && <AddressesTab />}

      {/* Tab 3: Change Password */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4 text-xs">
          {passwordMsg.text && (
            <div className={`p-2.5 rounded ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {passwordMsg.text}
            </div>
          )}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">New Password (min 6 characters)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-primary text-sm" />
          </div>
          <button type="submit" disabled={passwordLoading} className="px-5 py-2 bg-primary text-white font-bold rounded hover:opacity-90 disabled:opacity-50 text-sm">
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

