import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Percent,
  Clock3,
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
  ArrowRight
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { api, formatMoney } from '../../services/api.js';

export default function FoodRescuePage({
  auth,
  onNavigateHome,
  onOpenAuth,
  onFlash
}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservingItem, setReservingItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [busy, setBusy] = useState(false);

  // Address
  const userAddresses = auth?.user?.addresses || [];
  const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0] || {
    line1: '220 W 14th Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10011',
    phone: auth?.user?.phone || '+1 (555) 010-1849'
  };
  const [address, setAddress] = useState(defaultAddr);

  const fetchRescue = async () => {
    try {
      const data = await api('/rescue');
      setListings(data);
    } catch (err) {
      console.error('Fetch rescue listings error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescue();
    // Auto-sync every 5 seconds for live surplus inventory count
    const interval = setInterval(fetchRescue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenReserve = (item) => {
    if (!auth) {
      onFlash('Please sign in to reserve Food Rescue meals.');
      onOpenAuth('login');
      return;
    }
    setReservingItem(item);
    setQuantity(1);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    if (!address.line1 || !address.city) {
      return onFlash('Please provide a delivery address.');
    }

    setBusy(true);
    try {
      const res = await api(`/rescue/${reservingItem._id}/purchase`, {
        method: 'POST',
        body: {
          quantity,
          paymentMethod,
          address
        }
      });

      onFlash(`Surplus meal reserved successfully! ${res.remainingStock} portion(s) remaining.`);
      setReservingItem(null);
      fetchRescue();
    } catch (err) {
      onFlash(err.message || 'Could not reserve surplus meal');
      fetchRescue();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-28">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17211d] via-[#16382b] to-[#195c45] p-6 sm:p-10 text-white shadow-lg mb-10 border border-[#195c45]/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ef6b42] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-2xs mb-3">
            <Percent size={14} />
            <span>Good Food, Better Planet</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            Food Rescue Surplus
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-stone-200 leading-relaxed">
            Every day, top local kitchens bake and prepare fresh dishes that simply go unsold before closing. Rescue delicious, restaurant-grade portions at 40% to 50% off while preventing food waste.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-stone-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#e6efe8]" />
              Same Freshness & Standards
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={16} className="text-[#ef6b42]" />
              Limited Daily Portions
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Surplus Listings */}
      <div>
        <div className="flex items-end justify-between border-b border-[#e7e9e6] pb-4 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
              AVAILABLE TODAY
            </p>
            <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#17211d] mt-1">
              Active Surplus Batches
            </h2>
          </div>
          <span className="text-xs font-medium text-[#66706b]">
            Live stock auto-updates
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#66706b]">
            Scanning local kitchen surplus…
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            title="All surplus meals are claimed for now"
            description="Our partner kitchens have sold out of today's surplus batches. Check back in the afternoon or explore the main restaurant menus."
            actionText="Browse Full Menus"
            onAction={onNavigateHome}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((item) => {
              const discountPct = Math.round(
                ((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100
              );
              const isLowStock = item.quantity <= 3;

              return (
                <div
                  key={item._id}
                  className="group flex flex-col rounded-2xl border border-[#e7e9e6] bg-white p-4 shadow-2xs hover:shadow-md hover:border-[#ef6b42]/40 transition-all duration-300"
                >
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-stone-100">
                    <img
                      src={
                        item.food?.image ||
                        item.restaurant?.image ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-102"
                    />

                    {/* Savings pill */}
                    <div className="absolute top-2.5 left-2.5 rounded-lg bg-[#ef6b42] px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                      {discountPct}% OFF
                    </div>

                    {/* Stock pill */}
                    <div
                      className={`absolute bottom-2.5 right-2.5 rounded-lg px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-2xs border border-[#e7e9e6] ${
                        isLowStock
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-white/95 text-[#17211d]'
                      }`}
                    >
                      {item.quantity} portion{item.quantity > 1 ? 's' : ''} left
                    </div>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#195c45] truncate">
                        {item.restaurant?.name || 'Local Kitchen'}
                      </p>
                      <h3 className="font-serif text-base font-bold text-[#17211d] mt-0.5 leading-snug">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#66706b] line-clamp-2 leading-relaxed">
                        {item.description || 'Prepared fresh today, surplus before evening closure.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e7e9e6] flex items-center justify-between">
                      <div>
                        <del className="text-xs text-[#66706b] mr-1.5 font-medium">
                          {formatMoney(item.originalPrice)}
                        </del>
                        <span className="text-base font-bold text-[#195c45]">
                          {formatMoney(item.discountedPrice)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenReserve(item)}
                        disabled={item.quantity === 0}
                        className="rounded-xl bg-[#195c45] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#124534] transition active:scale-95 disabled:bg-stone-300 shadow-2xs"
                      >
                        {item.quantity > 0 ? 'Reserve' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservation Confirmation Modal */}
      {reservingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e7e9e6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7e9e6]">
              <div>
                <span className="rounded-full bg-[#fdf1ec] px-2 py-0.5 text-[10px] font-bold text-[#ef6b42]">
                  Instant Surplus Reservation
                </span>
                <h3 className="font-serif text-lg font-bold text-[#17211d] mt-1">
                  {reservingItem.name}
                </h3>
              </div>
              <button
                onClick={() => setReservingItem(null)}
                className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#f7f6f1] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPurchase} className="mt-4 space-y-4">
              <div className="flex items-center justify-between bg-[#f7f6f1] border border-[#e7e9e6] rounded-xl p-3 text-xs">
                <div>
                  <p className="font-bold text-[#17211d]">
                    Rescue Price: {formatMoney(reservingItem.discountedPrice)}
                  </p>
                  <p className="text-[#66706b]">
                    Original value: {formatMoney(reservingItem.originalPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-[#ef6b42] px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                    Save {formatMoney(reservingItem.originalPrice - reservingItem.discountedPrice)}
                  </span>
                </div>
              </div>

              {/* Quantity selector */}
              <div>
                <label className="block text-xs font-bold text-[#17211d] mb-1">
                  Select Portions (Max {Math.min(reservingItem.quantity, 5)})
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs font-semibold text-[#17211d] outline-none focus:border-[#195c45]"
                >
                  {Array.from({ length: Math.min(reservingItem.quantity, 5) }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {idx + 1} portion{idx + 1 > 1 ? 's' : ''} (
                      {formatMoney(reservingItem.discountedPrice * (idx + 1))})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery address */}
              <div>
                <label className="block text-xs font-bold text-[#17211d] mb-1">
                  Street Address
                </label>
                <input
                  required
                  type="text"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="Street address"
                  className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                />
              </div>

              {/* Payment selector */}
              <div>
                <label className="block text-xs font-bold text-[#17211d] mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`rounded-xl border p-2 font-semibold transition ${
                      paymentMethod === 'cod'
                        ? 'border-[#195c45] bg-[#e6efe8] text-[#195c45]'
                        : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`rounded-xl border p-2 font-semibold transition ${
                      paymentMethod === 'online'
                        ? 'border-[#195c45] bg-[#e6efe8] text-[#195c45]'
                        : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                    }`}
                  >
                    Simulated Online
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e7e9e6] flex items-center justify-between text-sm font-bold text-[#17211d]">
                <span>Total with Delivery</span>
                <span>{formatMoney(reservingItem.discountedPrice * quantity + 2.5)}</span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#195c45] py-2.5 text-xs font-semibold text-white hover:bg-[#124534] transition disabled:opacity-60 shadow-2xs"
              >
                {busy ? 'Reserving…' : 'Confirm & Reserve Meal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
