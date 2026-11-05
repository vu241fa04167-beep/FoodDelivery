import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import formatPrice from '../../utils/formatPrice.js';
import StatusBadge from '../StatusBadge.jsx';

const STATUS_BUTTONS = {
  placed: { label: 'Accept & Prepare', next: 'preparing', color: 'bg-amber-600' },
  preparing: { label: 'Out for Delivery', next: 'out_for_delivery', color: 'bg-primary' },
  out_for_delivery: { label: 'Mark Delivered', next: 'delivered', color: 'bg-green-600' }
};

export default function OwnerOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/restaurant');
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to fetch restaurant orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center py-10 text-xs text-gray-500">Loading incoming orders...</div>;
  if (orders.length === 0) return <div className="text-center py-12 bg-white border border-gray-200 rounded text-xs text-gray-500">No incoming orders yet.</div>;

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const nextAction = STATUS_BUTTONS[order.orderStatus];
        return (
          <div key={order._id} className="bg-white border border-gray-200 rounded p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b text-xs">
              <div>
                <span className="font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</span>
                <span className="text-gray-400 ml-2">({new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.orderStatus} />
                {nextAction && (
                  <button
                    type="button"
                    disabled={updatingId === order._id}
                    onClick={() => handleUpdateStatus(order._id, nextAction.next)}
                    className={`px-3 py-1 text-white text-xs font-bold rounded hover:opacity-90 disabled:opacity-50 ${nextAction.color}`}
                  >
                    {updatingId === order._id ? 'Updating...' : nextAction.label}
                  </button>
                )}
              </div>
            </div>

            <div className="py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-gray-800">Customer: {order.customer?.name} ({order.customer?.phone})</p>
                <p className="text-gray-500 text-[11px] mt-0.5">Address: {order.address}</p>
                <p className="text-gray-500 text-[11px]">Payment: <span className="font-bold uppercase text-gray-700">{order.paymentMethod}</span> ({order.paymentStatus})</p>
                {order.deliveryPartner?.name && ['out_for_delivery', 'delivered'].includes(order.orderStatus) && (
                  <p className="text-gray-700 text-[11px] mt-1 bg-gray-50 border border-gray-200 p-1.5 rounded">
                    <b>Delivery Partner:</b> {order.deliveryPartner.name} ({order.deliveryPartner.vehicleNumber}) • {order.deliveryPartner.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Items:</p>
                <div className="space-y-0.5 text-gray-600">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{it.name} × {it.quantity}</span>
                      <span>{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

