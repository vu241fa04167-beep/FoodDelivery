import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import formatPrice from '../utils/formatPrice.js';
import api from '../api/axios.js';

export default function Cart() {
  const { restaurant, items, itemTotal, increaseQty, decreaseQty, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);

  // Delivery fee is flat ₹30, free for orders above ₹500
  const deliveryFee = itemTotal >= 500 || itemTotal === 0 ? 0 : 30;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tax = Math.round(itemTotal * 0.05);
  const grandTotal = Math.max(0, itemTotal + deliveryFee + tax - discount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim(), orderTotal: itemTotal });
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidating(false);
    }
  };

  const handleProceed = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout', { state: { coupon: appliedCoupon } });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mb-6">Browse the menu and add your favourites to get started.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:opacity-90">
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cart</h1>
          <p className="text-xs text-gray-500">Ordering from <span className="font-semibold text-gray-800">{restaurant?.name}</span></p>
        </div>
        <Link to={`/restaurant/${restaurant?.id}`} className="text-xs text-primary font-semibold hover:underline">+ Add more items</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between p-3.5 bg-white/95 border border-orange-100 rounded-2xl shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <button type="button" onClick={() => decreaseQty(item.menuItemId)} className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 font-bold">-</button>
                  <span className="px-2 text-xs font-bold text-primary">{item.quantity}</span>
                  <button type="button" onClick={() => increaseQty(item.menuItemId)} className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 font-bold">+</button>
                </div>
                <span className="text-xs font-bold text-gray-800 w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
                <button type="button" onClick={() => removeItem(item.menuItemId)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
            </div>
          ))}

          {/* Coupon Input Form */}
          <div className="p-4 bg-white/95 border border-orange-100 rounded-2xl mt-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Apply Coupon</h4>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2.5 rounded text-xs">
                <span className="text-green-800 font-semibold">'{appliedCoupon.code}' applied! You saved {formatPrice(appliedCoupon.discount)}</span>
                <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-red-600 font-bold hover:underline">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input type="text" placeholder="Try WELCOME50, FLAT100" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="grow px-3 py-1.5 border border-gray-300 rounded text-xs uppercase focus:outline-none focus:border-primary" />
                <button type="submit" disabled={validating} className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded hover:bg-black disabled:opacity-50">
                  {validating ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-red-600 mt-2">{couponError}</p>}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white/95 border border-orange-100 rounded-2xl p-4 h-fit space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2">Bill Details</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between"><span>Item Total</span><span className="font-semibold text-gray-800">{formatPrice(itemTotal)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>{deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(deliveryFee)}</span></div>
            <div className="flex justify-between"><span>Taxes & Charges (5%)</span><span className="font-semibold text-gray-800">{formatPrice(tax)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700 font-semibold"><span>Discount ({appliedCoupon?.code})</span><span>-{formatPrice(discount)}</span></div>}
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-sm text-gray-900"><span>To Pay</span><span className="text-primary">{formatPrice(grandTotal)}</span></div>
          <button type="button" onClick={handleProceed} className="w-full mt-4 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:opacity-90">
            Proceed to checkout
          </button>
        </div>
      </div>
    </main>
  );
}
