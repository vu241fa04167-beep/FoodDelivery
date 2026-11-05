import React, { useState } from 'react';
import AdminOverviewTab from '../components/admin/AdminOverviewTab.jsx';
import AdminRestaurantsTab from '../components/admin/AdminRestaurantsTab.jsx';
import AdminCouponsTab from '../components/admin/AdminCouponsTab.jsx';
import AdminOrdersTab from '../components/admin/AdminOrdersTab.jsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'restaurants' | 'coupons'

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'restaurants', label: 'Restaurants' },
    { key: 'coupons', label: 'Coupons' }
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-200 mb-6 gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Platform Admin</h1>
          <p className="text-xs text-gray-500">Manage platform restaurants, coupons and real-time revenue</p>
        </div>

        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === t.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && <AdminOverviewTab />}
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'restaurants' && <AdminRestaurantsTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
    </main>
  );
}

