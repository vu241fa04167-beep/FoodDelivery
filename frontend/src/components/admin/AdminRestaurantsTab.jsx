import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import StatusBadge from '../StatusBadge.jsx';

export default function AdminRestaurantsTab() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/admin/restaurants');
      setRestaurants(res.data);
    } catch (e) {
      console.error('Failed to load restaurants', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleStatus = async (id, status) => {
    setActionId(id);
    try {
      await api.patch(`/admin/restaurants/${id}/status`, { status });
      await fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update restaurant status');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="text-center py-10 text-xs text-gray-500">Loading restaurants...</div>;

  return (
    <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100 shadow-xs">
      {restaurants.map((rest) => {
        const isPending = rest.status === 'pending';
        return (
          <div key={rest._id} className={`p-4 flex flex-wrap items-center justify-between gap-3 text-xs ${isPending ? 'bg-amber-50/50' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 text-sm">{rest.name}</h4>
                <StatusBadge status={rest.status} />
                {rest.isPureVeg && <span className="bg-green-700 text-white px-1.5 py-0.2 text-[10px] rounded font-bold">Pure Veg</span>}
              </div>
              <p className="text-gray-500 mt-0.5">{rest.cuisine} • {rest.area}, Bengaluru</p>
              <p className="text-gray-400 text-[11px]">Owner: {rest.owner?.name} ({rest.owner?.email})</p>
            </div>

            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <button
                    type="button"
                    disabled={actionId === rest._id}
                    onClick={() => handleStatus(rest._id, 'approved')}
                    className="px-3 py-1.5 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={actionId === rest._id}
                    onClick={() => handleStatus(rest._id, 'rejected')}
                    className="px-3 py-1.5 bg-red-600 text-white font-bold rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={actionId === rest._id}
                  onClick={() => handleStatus(rest._id, rest.status === 'approved' ? 'rejected' : 'approved')}
                  className="px-3 py-1 border border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50"
                >
                  {rest.status === 'approved' ? 'Revoke Approval' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

