import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';
import formatDate from '../utils/formatDate.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Orders() {
  const fallbackImage = '/images/foods/fallback.jpg';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { loadCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/mine');
        setOrders(res.data);
      } catch (err) {
        setError(err.isAuthError ? 'Your session could not be verified. Please retry, or sign in again if the problem continues.' : 'Failed to fetch your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    const targetRest = {
      id: order.restaurant?._id || order.restaurant,
      name: order.restaurant?.name || 'Restaurant'
    };
    const cartItems = order.items.map((it) => ({
      menuItemId: it.menuItem?._id || it.menuItem,
      name: it.name,
      price: it.price,
      isVeg: it.isVeg,
      quantity: it.quantity
    }));

    const ok = loadCart(targetRest, cartItems);
    if (ok) navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse bg-white border border-gray-200 rounded p-4 h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded">
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">No orders yet</h2>
        <p className="text-xs text-gray-500 mb-6">Looks like you haven't placed any orders yet. Discover top restaurants now.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:opacity-90">
          Find food
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Past Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const restName = order.restaurant?.name || 'Restaurant';
          const itemsSummary = order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ');

          return (
            <div key={order._id} className="bg-white/95 border border-orange-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2"><img src={order.restaurant?.image || fallbackImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }} alt="" className="w-9 h-9 rounded-lg object-cover" /><h3 className="font-bold text-gray-900 text-sm">{restName}</h3></div>
                  <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="py-2.5">
                <p className="text-xs text-gray-600 line-clamp-1">{itemsSummary}</p>
                {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && order.estimatedDeliveryAt && <p className="mt-2 text-xs font-semibold text-orange-700">Expected by {new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900">Total: {formatPrice(order.grandTotal)}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleReorder(order)} className="px-3 py-1 border border-primary text-primary text-xs font-bold rounded hover:bg-orange-50">
                    Reorder
                  </button>
                  <Link to={`/orders/${order._id}`} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:opacity-90">
                    Track order
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
