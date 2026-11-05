import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  RotateCw,
  Star,
  XCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import ReviewModal from '../../components/customer/ReviewModal.jsx';
import { api, formatMoney } from '../../services/api.js';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Clock3 },
  { key: 'accepted', label: 'Kitchen Accepted', icon: CheckCircle2 },
  { key: 'preparing', label: 'Cooking & Packing', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export default function OrdersPage({
  auth,
  onNavigateHome,
  onReorder,
  onFlash
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await api('/orders/my');
      setOrders(data);
      // If an order is currently selected, refresh its details too
      if (selectedOrder) {
        const updated = data.find((o) => o._id === selectedOrder._id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Fetch orders error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-polling every 4 seconds for live status updates
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: { reason: 'Cancelled by customer before kitchen prep' }
      });
      onFlash('Order has been cancelled.');
      fetchOrders();
    } catch (err) {
      onFlash(err.message || 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStepIndex = (status) => {
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  if (!auth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Sign in to view your orders"
          description="Your real-time order history, tracking and delivery updates will appear here."
          actionText="Sign In"
          onAction={onNavigateHome}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-8 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
            DELIVERIES & HISTORY
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d] mt-1">
            Your Orders
          </h1>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 rounded-xl border border-[#e7e9e6] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
        >
          <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#66706b]">
          Loading your delivery history…
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          description="Discover artisan local kitchens and place your first delicious order."
          actionText="Explore Restaurants"
          onAction={onNavigateHome}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Orders List (Col 7) */}
          <div className="lg:col-span-7 space-y-3.5">
            {orders.map((order) => {
              const isSelected = selectedOrder?._id === order._id;
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`rounded-2xl border p-4 sm:p-5 cursor-pointer transition ${
                    isSelected
                      ? 'border-[#195c45] bg-[#e6efe8]/30 shadow-xs'
                      : 'border-[#e7e9e6] bg-white hover:border-[#195c45]/40 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={order.restaurant?.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'}
                        alt={order.restaurant?.name}
                        className="h-12 w-12 rounded-xl object-cover border border-[#e7e9e6] shrink-0"
                      />
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#17211d]">
                          {order.restaurant?.name || 'Local Kitchen'}
                        </h3>
                        <p className="text-xs text-[#66706b] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status & Speed Badges */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          isDelivered
                            ? 'bg-[#e6efe8] text-[#195c45]'
                            : isCancelled
                            ? 'bg-red-50 text-red-700'
                            : 'bg-[#fdf1ec] text-[#ef6b42]'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.deliverySpeed === 'priority' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          ⚡ Priority Rush
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="mt-3 text-xs text-[#66706b] line-clamp-1">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>

                  {/* Footer total and details trigger */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-[#e7e9e6] pt-3 text-xs">
                    <span className="text-[#66706b]">
                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#17211d] text-sm">
                        {formatMoney(order.total)}
                      </span>
                      <ChevronRight size={15} className="text-[#66706b]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Live Tracker & Actions (Col 5) */}
          <div className="lg:col-span-5">
            {selectedOrder ? (
              <div className="sticky top-24 rounded-2xl border border-[#e7e9e6] bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#e7e9e6]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#66706b]">Live Status Tracker</p>
                    <h3 className="font-serif text-lg font-bold text-[#17211d]">
                      {selectedOrder.restaurant?.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#66706b]">
                    #{selectedOrder._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                {/* Progress Timeline */}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'rejected' ? (
                  <div className="py-1 space-y-3.5">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(selectedOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <div
                            className={`grid h-7 w-7 place-items-center rounded-full transition ${
                              isComplete
                                ? 'bg-[#195c45] text-white shadow-2xs'
                                : 'bg-[#f7f6f1] border border-[#e7e9e6] text-[#66706b]'
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-xs font-bold ${
                                isComplete ? 'text-[#17211d]' : 'text-[#66706b]'
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-[11px] text-[#ef6b42] font-semibold">
                                In Progress…
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
                    <p className="font-bold">This order was cancelled</p>
                    <p className="mt-1">{selectedOrder.cancelReason || 'Cancelled upon request.'}</p>
                  </div>
                )}

                {/* Delivery details */}
                <div className="rounded-xl bg-[#f7f6f1] border border-[#e7e9e6] p-3 text-xs space-y-1 text-[#17211d]">
                  <p className="font-bold text-[#17211d]">Delivery Address</p>
                  <p className="text-[#66706b]">{selectedOrder.deliveryAddress?.line1}, {selectedOrder.deliveryAddress?.city}</p>
                  {selectedOrder.deliveryInstructions && (
                    <p className="italic text-[#66706b]">"{selectedOrder.deliveryInstructions}"</p>
                  )}
                </div>

                {/* Items breakdown */}
                <div className="space-y-1.5 text-xs text-[#66706b] border-t border-[#e7e9e6] pt-3">
                  <p className="font-bold text-[#17211d] mb-1.5">Order Items</p>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity} × {item.name}</span>
                      <span className="font-semibold text-[#17211d]">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {selectedOrder.priorityFee > 0 && (
                    <div className="flex justify-between text-amber-800 font-semibold pt-1">
                      <span>⚡ Priority Rush Delivery</span>
                      <span>+{formatMoney(selectedOrder.priorityFee)}</span>
                    </div>
                  )}
                  {selectedOrder.tip > 0 && (
                    <div className="flex justify-between text-[#66706b] pt-1">
                      <span>Courier Tip</span>
                      <span className="font-semibold text-[#17211d]">+{formatMoney(selectedOrder.tip)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-[#195c45] font-semibold pt-1">
                      <span>Promo Discount</span>
                      <span>-{formatMoney(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#e7e9e6] text-sm font-bold text-[#17211d]">
                    <span>Total Paid</span>
                    <span>{formatMoney(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-[#e7e9e6]">
                  {/* Cancel button: only allowed when status is 'placed' */}
                  {selectedOrder.status === 'placed' && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      disabled={cancelling}
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                    >
                      {cancelling ? 'Cancelling…' : 'Cancel Order'}
                    </button>
                  )}

                  {/* If status is already preparing, explain rule */}
                  {['accepted', 'preparing', 'out_for_delivery'].includes(selectedOrder.status) && (
                    <p className="text-[11px] text-[#66706b] text-center italic">
                      Order is being freshly prepared and cannot be cancelled online.
                    </p>
                  )}

                  {/* Reorder Button */}
                  <button
                    onClick={() => onReorder(selectedOrder)}
                    className="w-full rounded-xl bg-[#195c45] py-2.5 text-xs font-semibold text-white hover:bg-[#124534] transition shadow-xs"
                  >
                    Reorder These Dishes
                  </button>

                  {/* Review Button for Delivered Orders */}
                  {selectedOrder.status === 'delivered' && (
                    <button
                      onClick={() => setReviewOrder(selectedOrder)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
                    >
                      <Star size={14} fill="currentColor" />
                      <span>Rate & Review Kitchen</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e7e9e6] p-10 text-center text-xs text-[#66706b]">
                Select an order from the list to track its live preparation and delivery status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={Boolean(reviewOrder)}
          onClose={() => setReviewOrder(null)}
          order={reviewOrder}
          onReviewSubmitted={(msg) => {
            onFlash(msg);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
