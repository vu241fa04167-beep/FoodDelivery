import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import StatusSteps from '../components/StatusSteps.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function OrderTracking() {
  const fallbackImage = '/images/foods/fallback.jpg', { id } = useParams();
  const [order, setOrder] = useState(null), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [rating, setRating] = useState(5);
  const [comment, setComment] = useState(''), [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = async () => {
    try { const res = await api.get(`/orders/${id}`); setOrder(res.data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!order || !['placed', 'preparing', 'out_for_delivery'].includes(order.orderStatus)) return;
    const interval = setInterval(() => { fetchOrder(); }, 10000);
    return () => clearInterval(interval);
  }, [order?.orderStatus]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try { const res = await api.patch(`/orders/${id}/cancel`); setOrder(res.data.order); }
    catch (err) { alert(err.response?.data?.message || 'Could not cancel order'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await api.post(`/orders/${id}/review`, { rating, comment });
      setOrder(res.data.order);
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-center text-xs text-gray-500">Loading order...</div>;
  if (error || !order) return (
    <div className="max-w-md mx-auto p-8 text-center text-xs">
      <p className="text-sm text-red-600 mb-2">{error || 'Order not found'}</p>
      <Link to="/orders" className="font-bold text-primary hover:underline">Back to My Orders</Link>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Track Order #{order._id.slice(-6).toUpperCase()}</h1>
          <div className="flex items-center gap-2 mt-1"><img src={order.restaurant?.image || fallbackImage} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }} alt="" className="w-7 h-7 rounded-md object-cover" /><p className="text-xs text-gray-500">From <span className="font-semibold text-gray-800">{order.restaurant?.name}</span></p></div>
        </div>
        <Link to="/orders" className="text-xs text-primary font-bold hover:underline">All Orders →</Link>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded p-3 text-xs flex justify-between items-center text-gray-700">
        <span className="font-semibold">{order.orderStatus === 'delivered' ? 'Food has arrived' : order.orderStatus === 'cancelled' ? 'Order cancelled' : 'Order in progress'}</span>
        <span className="text-gray-500">{order.estimatedDeliveryAt ? `ETA: ${new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded p-4">
        <StatusSteps currentStatus={order.orderStatus} />
        {order.orderStatus === 'placed' && (
          <div className="text-center pt-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={handleCancel} className="text-xs text-red-600 font-bold hover:underline">Cancel order</button>
          </div>
        )}
      </div>

      {order.orderStatus !== 'cancelled' && (
        ['out_for_delivery', 'delivered'].includes(order.orderStatus) && order.deliveryPartner?.name ? (
          <div className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <div><p className="font-bold text-gray-800 text-sm">{order.deliveryPartner.name}</p><p className="text-gray-500">{order.deliveryPartner.vehicleNumber}</p></div>
            </div>
            <a href={`tel:${order.deliveryPartner.phone}`} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold hover:bg-green-100">📞 Call ({order.deliveryPartner.phone})</a>
          </div>
        ) : ['placed', 'preparing'].includes(order.orderStatus) ? (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 flex items-center gap-2">
            <span>🛵</span><span>A delivery partner will be assigned once your order is out for delivery.</span>
          </div>
        ) : null
      )}

      {order.orderStatus === 'delivered' && (
        <div className="bg-white border border-gray-200 rounded p-4 text-xs">
          <h3 className="font-bold text-gray-800 uppercase tracking-wide mb-2">Order Feedback</h3>
          {order.isReviewed ? (
            <p className="bg-green-50 border border-green-200 p-3 rounded text-green-800 font-semibold">★ You rated this {order.rating} / 5 stars {order.reviewComment ? `("${order.reviewComment}")` : ''}. Thank you!</p>
          ) : (
            <form onSubmit={handleReview} className="space-y-3">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-600 mr-2">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} className={`text-xl ${s <= rating ? 'text-amber-500' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <input type="text" placeholder="Write a short review (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none focus:border-primary" />
              <button type="submit" disabled={submittingReview} className="px-4 py-1.5 bg-primary text-white font-bold rounded shadow-xs hover:opacity-90 disabled:opacity-50">{submittingReview ? 'Submitting...' : 'Submit review'}</button>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
          <h3 className="font-bold text-gray-800 uppercase tracking-wide border-b pb-1.5">Items Ordered</h3>
          <div className="divide-y divide-gray-100">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-1.5 flex justify-between">
                <span>{it.name} × {it.quantity}</span>
                <span className="font-semibold">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t text-gray-500">
            <p className="font-semibold text-gray-700">Delivery Address:</p>
            <p className="mt-0.5">{order.address}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4 space-y-2">
          <h3 className="font-bold text-gray-800 uppercase tracking-wide border-b pb-1.5">Summary & Payment</h3>
          <p className="flex justify-between text-gray-600"><span>Payment Method</span><span className="font-bold uppercase text-gray-800">{order.paymentMethod}</span></p>
          <p className="flex justify-between text-gray-600"><span>Payment Status</span><span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</span></p>
          <div className="border-t pt-2 space-y-1 text-gray-600">
            <p className="flex justify-between"><span>Item Total</span><span>{formatPrice(order.itemTotal)}</span></p>
            <p className="flex justify-between"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span></p>
            <p className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(order.tax)}</span></p>
            {order.discount > 0 && <p className="flex justify-between text-green-700 font-bold"><span>Discount</span><span>-{formatPrice(order.discount)}</span></p>}
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-sm text-gray-900">
            <span>Grand Total</span><span className="text-primary">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
