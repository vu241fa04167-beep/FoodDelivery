import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { formatMoney, api } from '../../services/api.js';
import EmptyState from '../common/EmptyState.jsx';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const restaurant = items[0]?.food?.restaurant;

  const subtotal = items.reduce(
    (sum, item) => sum + (item.food?.price || 0) * item.quantity,
    0
  );
  const deliveryFee = restaurant?.deliveryFee !== undefined ? restaurant.deliveryFee : 2.5;
  const discountAmount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api('/cart/apply-coupon', {
        method: 'POST',
        body: { code }
      });
      onApplyCoupon(res);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message || 'Invalid promo code');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e7e9e6] px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#195c45] h-5 w-5" />
              <h2 className="font-serif text-xl font-bold text-[#17211d]">Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#f7f6f1] transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Restaurant Banner if items exist */}
          {restaurant && (
            <div className="flex items-center justify-between bg-[#f7f6f1] px-6 py-3 border-b border-[#e7e9e6]">
              <div>
                <p className="text-[10px] text-[#66706b] uppercase tracking-wider font-bold">Ordering From</p>
                <p className="text-sm font-bold text-[#17211d]">{restaurant.name}</p>
              </div>
              <button
                onClick={onClearCart}
                className="text-xs font-semibold text-[#66706b] hover:text-red-600 transition flex items-center gap-1"
                title="Clear entire cart"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
            {items.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                description="Browse handpicked menus from the finest local kitchens and add your favorite dishes."
                actionText="Explore Menus"
                onAction={onClose}
              />
            ) : (
              items.map((item) => (
                <div key={item._id || item.food?._id} className="py-4 flex gap-3.5 items-start">
                  <img
                    src={item.food?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.food?.name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#17211d] leading-snug">
                      {item.food?.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {formatMoney(item.food?.price)} each
                    </p>

                    {item.notes && (
                      <p className="text-[11px] italic text-[#195c45] bg-[#e5f0d9]/40 px-2 py-0.5 rounded mt-1 line-clamp-1">
                        Note: {item.notes}
                      </p>
                    )}

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-1 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.food, item.quantity - 1)}
                          className="p-1 rounded text-stone-600 hover:text-[#195c45] hover:bg-white transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#17211d]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.food, item.quantity + 1)}
                          className="p-1 rounded text-stone-600 hover:text-[#195c45] hover:bg-white transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => onUpdateQuantity(item.food, 0)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition ml-auto"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#17211d]">
                    {formatMoney((item.food?.price || 0) * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="border-t border-[#e7e9e6] bg-[#f7f6f1] p-6 space-y-4">
              {/* Promo code input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-[#e6efe8] border border-[#195c45]/20 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 text-[#195c45] font-semibold">
                      <Tag size={14} />
                      <span>{appliedCoupon.code} ({appliedCoupon.description || 'Applied'})</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-[#66706b] hover:text-red-600 font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (e.g. SAVOR10)"
                      className="flex-1 rounded-xl border border-[#e7e9e6] bg-white px-3 py-2 text-xs uppercase outline-none focus:border-[#195c45]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="rounded-xl bg-[#195c45] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#124534] transition disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking…' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 pl-1">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#66706b]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#17211d]">{formatMoney(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#195c45] font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-[#17211d]">{formatMoney(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#17211d] pt-2 border-t border-[#e7e9e6]">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#195c45] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#124534] transition active:scale-98"
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#66706b]">
                <ShieldCheck size={13} className="text-[#195c45]" />
                <span>Secure payment and freshly sealed delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
