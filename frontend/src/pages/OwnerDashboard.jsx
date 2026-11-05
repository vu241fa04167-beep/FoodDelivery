import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import RestaurantCreateForm from '../components/owner/RestaurantCreateForm.jsx';
import OwnerOrdersTab from '../components/owner/OwnerOrdersTab.jsx';
import OwnerMenuTab from '../components/owner/OwnerMenuTab.jsx';

export default function OwnerDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'

  const fetchMyRestaurant = async () => {
    try {
      const res = await api.get('/restaurants/mine');
      setRestaurant(res.data);
    } catch {
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  if (loading) return <div className="text-center py-16 text-xs text-gray-500">Loading dashboard...</div>;

  if (!restaurant) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <RestaurantCreateForm onCreated={(newRest) => setRestaurant(newRest)} />
      </main>
    );
  }

  if (restaurant.status === 'pending') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Waiting for Admin Approval</h2>
          <p className="text-xs text-gray-600">
            Your restaurant <b>"{restaurant.name}"</b> has been registered and is currently under review by the platform administrator.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-200 mb-6 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-xs text-gray-500">Partner Dashboard • {restaurant.area}, Bengaluru</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'menu' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Menu
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? <OwnerOrdersTab /> : <OwnerMenuTab restaurantId={restaurant._id} />}
    </main>
  );
}

