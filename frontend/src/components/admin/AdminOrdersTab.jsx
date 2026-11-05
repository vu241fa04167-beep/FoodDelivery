import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import formatPrice from '../../utils/formatPrice.js';
import StatusBadge from '../StatusBadge.jsx';

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-10 text-center text-xs text-gray-500">Loading incoming orders...</div>;
  if (!orders.length) return <div className="py-12 text-center bg-white border border-gray-200 rounded text-xs text-gray-500">No orders have been placed yet.</div>;

  return <div className="space-y-3">{orders.map((order) => <article key={order._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"><div className="flex flex-wrap justify-between gap-2"><div><p className="text-sm font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p><p className="text-xs text-gray-500">{order.customer?.name || 'Customer'} · {order.customer?.phone || 'No phone'}</p></div><StatusBadge status={order.orderStatus} /></div><div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs"><p><span className="font-semibold">Items:</span> {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p><p><span className="font-semibold">Deliver to:</span> {order.address}</p></div><div className="mt-3 pt-2 border-t flex justify-between text-xs"><span className="text-gray-500">Payment: {order.paymentMethod}</span><span className="font-bold text-primary">{formatPrice(order.grandTotal)}</span></div></article>)}</div>;
}
