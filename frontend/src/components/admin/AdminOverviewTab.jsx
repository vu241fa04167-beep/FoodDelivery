import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import formatPrice from '../../utils/formatPrice.js';

export default function AdminOverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-10 text-xs text-gray-500">Loading overview...</div>;
  if (!stats) return <div className="text-center py-10 text-xs text-red-500">Failed to load platform stats.</div>;

  const cards = [
    { label: 'Total Users', value: stats.usersCount, sub: 'Customers, owners & admins' },
    { label: 'Restaurants', value: stats.restaurantsCount, sub: 'Registered food partners' },
    { label: 'Total Orders', value: stats.ordersCount, sub: 'All-time placed orders' },
    { label: 'Platform Revenue', value: formatPrice(stats.totalRevenue), sub: 'Gross merchandise value' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded p-4 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

