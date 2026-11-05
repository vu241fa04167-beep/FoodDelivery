import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Tag,
  Check,
  Plus,
  AlertCircle
} from 'lucide-react';
import { api, formatMoney } from '../../services/api.js';

export default function CheckoutPage({
  auth,
  cart,
  onBack,
  onOrderSuccess,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onFlash
}) {
  const user = auth?.user;
  const addresses = user?.addresses || [];

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || {
    label: 'Home',
    line1: '',
    city: 'New York',
    state: 'NY',
    postalCode: '',
    phone: user?.phone || ''
  };

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    line1: '',
    city: 'New York',
    state: 'NY',
    postalCode: '',
    phone: user?.phone || ''
  });

  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState('standard'); // 'standard' | 'priority'
  const [tip, setTip] = useState(2);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'
  const [cardDetails, setCardDetails] = useState({
    name: user?.name || '',
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '888'
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [busy, setBusy] = useState(false);
  const [idempotencyKey] = useState(() => (crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`));

  const items = cart?.items || [];
  const restaurant = items[0]?.food?.restaurant;

  const subtotal = items.reduce(
    (sum, item) => sum + (item.food?.price || 0) * item.quantity,
    0
  );
  const deliveryFee = restaurant?.deliveryFee !== undefined ? restaurant.deliveryFee : 2.5;
  const discount = appliedCoupon?.discount || 0;
  const activeTip = isCustomTip ? Math.max(0, Number(customTip) || 0) : Number(tip || 0);
  const priorityFee = deliverySpeed === 'priority' ? 1.99 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee + priorityFee + activeTip);

  const activeAddress = isAddingNewAddress
    ? newAddress
    : addresses[selectedAddressIndex] || defaultAddr;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api('/cart/apply-coupon', {
        method: 'POST',
        body: { code: couponCode.trim().toUpperCase() }
      });
      onApplyCoupon(res);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message || 'Invalid promo code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!activeAddress.line1 || !activeAddress.city) {
      return onFlash('Please provide a complete street address and city.');
    }
    if (items.length === 0) {
      return onFlash('Your cart is empty.');
    }

    setBusy(true);
    try {
      const order = await api('/orders/checkout', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey
        },
        body: {
          address: activeAddress,
          deliveryInstructions,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          tip: activeTip,
          deliverySpeed
        }
      });

      onFlash('Order placed successfully! The kitchen is preparing your dishes.');
      onOrderSuccess(order);
    } catch (err) {
      onFlash(err.message || 'Checkout failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-8 pb-28">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#195c45] transition mb-6"
      >
        <ArrowLeft size={16} />
        <span>Return to restaurant</span>
      </button>

      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
          CHECKOUT & CONFIRMATION
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d] mt-1">
          Finalize your order
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Checkout Steps (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <section className="rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#195c45] text-xs font-bold text-white">
                1
              </span>
              <h2 className="font-serif text-lg font-bold text-[#17211d]">
                Delivery Address
              </h2>
            </div>

            {/* Saved address selector */}
            {!isAddingNewAddress && addresses.length > 0 && (
              <div className="space-y-2.5 mb-4">
                {addresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      selectedAddressIndex === idx
                        ? 'border-[#195c45] bg-[#e6efe8]/40'
                        : 'border-[#e7e9e6] hover:bg-[#f7f6f1]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      className="mt-1 accent-[#195c45]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#17211d]">{addr.label || 'Home'}</span>
                        {addr.isDefault && (
                          <span className="rounded bg-[#f7f6f1] border border-[#e7e9e6] px-1.5 py-0.2 text-[10px] font-semibold text-[#66706b]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[#17211d] mt-0.5">{addr.line1}</p>
                      <p className="text-[#66706b]">
                        {addr.city}, {addr.state} {addr.postalCode} · {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#195c45] hover:underline pt-1"
                >
                  <Plus size={14} />
                  <span>Use a different delivery address</span>
                </button>
              </div>
            )}

            {/* Form for new/direct address */}
            {(isAddingNewAddress || addresses.length === 0) && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17211d] mb-1">Address Label</label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      placeholder="Home, Office, Hotel..."
                      className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17211d] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="+1 (555) 012-3456"
                      className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17211d] mb-1">Street Address *</label>
                  <input
                    required
                    type="text"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    placeholder="220 W 14th Street, Apt 4B"
                    className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17211d] mb-1">City *</label>
                    <input
                      required
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17211d] mb-1">State</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17211d] mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      placeholder="10011"
                      className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                    />
                  </div>
                </div>

                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="text-xs font-semibold text-[#66706b] hover:text-[#17211d] underline"
                  >
                    Select from saved addresses
                  </button>
                )}
              </div>
            )}

            {/* Courier Delivery Instructions */}
            <div className="mt-4 pt-4 border-t border-[#e7e9e6]">
              <label className="block text-xs font-bold text-[#17211d] mb-1">
                Drop-off Instructions (Optional)
              </label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Leave with doorman, gate code #1042, call on arrival"
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>
          </section>

          {/* Step 2: Delivery Speed & Courier Tip */}
          <section className="rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#195c45] text-xs font-bold text-white">
                2
              </span>
              <h2 className="font-serif text-lg font-bold text-[#17211d]">
                Speed & Courier Tip
              </h2>
            </div>

            {/* Delivery Speed selection */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-[#17211d] mb-2">Delivery Speed</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    deliverySpeed === 'standard'
                      ? 'border-[#195c45] bg-[#e6efe8]/40'
                      : 'border-[#e7e9e6] hover:bg-[#f7f6f1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliverySpeed"
                    checked={deliverySpeed === 'standard'}
                    onChange={() => setDeliverySpeed('standard')}
                    className="mt-0.5 accent-[#195c45]"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-[#17211d]">Standard Delivery</p>
                    <p className="text-[#66706b] mt-0.5">25–35 min · Included</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    deliverySpeed === 'priority'
                      ? 'border-[#195c45] bg-[#e6efe8]/40'
                      : 'border-[#e7e9e6] hover:bg-[#f7f6f1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliverySpeed"
                    checked={deliverySpeed === 'priority'}
                    onChange={() => setDeliverySpeed('priority')}
                    className="mt-0.5 accent-[#195c45]"
                  />
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#17211d]">Priority Rush</span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                        +$1.99
                      </span>
                    </div>
                    <p className="text-[#66706b] mt-0.5">15–20 min · Delivered direct to you</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Courier Tip Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#17211d]">Courier Tip</label>
                <span className="text-[11px] text-[#66706b]">100% goes directly to your driver</span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-2">
                {[0, 2, 3, 5].map((amt) => {
                  const selected = !isCustomTip && tip === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setIsCustomTip(false);
                        setTip(amt);
                      }}
                      className={`rounded-xl border py-2 text-xs font-bold transition text-center ${
                        selected
                          ? 'border-[#195c45] bg-[#195c45] text-white shadow-2xs'
                          : 'border-[#e7e9e6] bg-white text-[#17211d] hover:border-[#195c45]/40'
                      }`}
                    >
                      {amt === 0 ? 'No tip' : `$${amt}`}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsCustomTip(true)}
                  className={`rounded-xl border py-2 text-xs font-bold transition text-center ${
                    isCustomTip
                      ? 'border-[#195c45] bg-[#195c45] text-white shadow-2xs'
                      : 'border-[#e7e9e6] bg-white text-[#17211d] hover:border-[#195c45]/40'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomTip && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#66706b]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Enter tip amount"
                    className="w-36 rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2 text-xs text-[#17211d] outline-none focus:border-[#195c45]"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Step 3: Payment Method */}
          <section className="rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#195c45] text-xs font-bold text-white">
                3
              </span>
              <h2 className="font-serif text-lg font-bold text-[#17211d]">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <label
                className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                  paymentMethod === 'online'
                    ? 'border-[#195c45] bg-[#e6efe8]/40'
                    : 'border-[#e7e9e6] hover:bg-[#f7f6f1]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-[#195c45]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#17211d]">
                    <CreditCard size={15} className="text-[#195c45]" />
                    <span>Credit / Debit Card</span>
                  </div>
                  <span className="text-[11px] text-[#66706b]">Instant simulated payment</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-[#195c45] bg-[#e6efe8]/40'
                    : 'border-[#e7e9e6] hover:bg-[#f7f6f1]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#195c45]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#17211d]">
                    <Banknote size={15} className="text-[#195c45]" />
                    <span>Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] text-[#66706b]">Pay courier at your doorstep</span>
                </div>
              </label>
            </div>

            {/* Simulated Card Fields */}
            {paymentMethod === 'online' && (
              <div className="rounded-xl border border-[#e7e9e6] bg-[#f7f6f1] p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17211d]">Simulated Card Details</span>
                  <span className="rounded bg-[#e6efe8] border border-[#195c45]/20 px-2 py-0.5 text-[10px] font-bold text-[#195c45]">
                    Test Mode Ready
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#66706b] mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs text-[#17211d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#66706b] mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs font-mono text-[#17211d] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#66706b] mb-1">Expires</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs font-mono text-[#17211d] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#66706b] mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full rounded-lg border border-[#e7e9e6] bg-white p-2 text-xs font-mono text-[#17211d] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Order Summary & Confirm (Col 5) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#17211d] pb-3 border-b border-[#e7e9e6]">
              Order Summary
            </h3>

            {restaurant && (
              <div className="rounded-xl bg-[#f7f6f1] border border-[#e7e9e6] p-3 text-xs">
                <span className="text-[#66706b] uppercase font-bold text-[10px]">Kitchen</span>
                <p className="font-bold text-[#17211d] text-sm mt-0.5">{restaurant.name}</p>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-[#e7e9e6]">
              {items.map((i) => (
                <div key={i._id} className="pt-2 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#17211d]">
                      {i.quantity} × {i.food?.name}
                    </span>
                    {i.notes && (
                      <p className="text-[10px] text-[#195c45] italic">{i.notes}</p>
                    )}
                  </div>
                  <span className="font-semibold text-[#17211d]">
                    {formatMoney((i.food?.price || 0) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code section */}
            <div className="pt-2 border-t border-[#e7e9e6]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-[#e6efe8] border border-[#195c45]/20 px-3 py-2 text-xs text-[#195c45] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} />
                    <span>Coupon {appliedCoupon.code} applied</span>
                  </div>
                  <button
                    onClick={onRemoveCoupon}
                    className="text-[#66706b] hover:text-red-600 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code (e.g. SAVOR10)"
                    className="flex-1 rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] px-3 py-2 text-xs uppercase outline-none focus:border-[#195c45] focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-xl bg-[#17211d] px-3.5 py-2 text-xs font-semibold text-white hover:bg-black transition disabled:opacity-50"
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 border-t border-[#e7e9e6] pt-3 text-xs text-[#66706b]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#17211d]">{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#195c45] font-semibold">
                  <span>Discount</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#17211d]">{formatMoney(deliveryFee)}</span>
              </div>
              {priorityFee > 0 && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Priority Rush (15-20m)</span>
                  <span>+{formatMoney(priorityFee)}</span>
                </div>
              )}
              {activeTip > 0 && (
                <div className="flex justify-between text-[#66706b]">
                  <span>Courier Tip</span>
                  <span className="font-semibold text-[#17211d]">+{formatMoney(activeTip)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#17211d] pt-2 border-t border-[#e7e9e6]">
                <span>Total Due</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={busy || items.length === 0}
              className="w-full rounded-xl bg-[#195c45] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#124534] transition disabled:opacity-60 active:scale-98"
            >
              {busy ? 'Securing & Placing Order…' : `Place Order · ${formatMoney(total)}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#66706b]">
              <ShieldCheck size={14} className="text-[#195c45]" />
              <span>Encrypted checkout with duplicate protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
