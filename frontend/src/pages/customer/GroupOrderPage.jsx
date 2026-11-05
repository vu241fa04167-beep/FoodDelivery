import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  ShoppingBag,
  ExternalLink,
  Utensils,
  Share2
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { api, formatMoney } from '../../services/api.js';

export default function GroupOrderPage({
  auth,
  onNavigateHome,
  onOpenAuth,
  onFlash,
  initialGroupCode,
  onOrderSuccess
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState(initialGroupCode || '');
  const [currentGroup, setCurrentGroup] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Checkout modal for group creator
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const userAddresses = auth?.user?.addresses || [];
  const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0] || {
    line1: '220 W 14th Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10011',
    phone: auth?.user?.phone || ''
  };
  const [checkoutAddress, setCheckoutAddress] = useState(defaultAddr);
  const [checkoutPayment, setCheckoutPayment] = useState('online');
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  // Load restaurants for group creation
  useEffect(() => {
    api('/restaurants')
      .then((data) => {
        setRestaurants(data);
        if (data.length > 0) setSelectedRestaurantId(data[0]._id);
      })
      .catch(() => {});
  }, []);

  // If initial group code provided (e.g. from invite link), join automatically
  useEffect(() => {
    if (initialGroupCode && auth) {
      handleJoinGroup(initialGroupCode);
    }
  }, [initialGroupCode, auth]);

  // Live polling for current group order every 3 seconds
  useEffect(() => {
    if (!currentGroup?.code) return;

    const poll = async () => {
      try {
        const updated = await api(`/groups/${currentGroup.code}`);
        setCurrentGroup(updated);
        // If order checked out, notify
        if (updated.status === 'checked_out' && updated.associatedOrder) {
          onFlash('Group order checked out by host!');
        }
      } catch (err) {
        console.error('Group poll error', err);
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [currentGroup?.code]);

  // Load restaurant menu when group is active
  useEffect(() => {
    if (!currentGroup?.restaurant?._id) return;
    api(`/restaurants/${currentGroup.restaurant._id}`)
      .then((data) => {
        setRestaurantMenu(data.foods || []);
      })
      .catch(() => {});
  }, [currentGroup?.restaurant?._id]);

  const handleCreateGroup = async () => {
    if (!auth) {
      onFlash('Please sign in to create a group order.');
      onOpenAuth('login');
      return;
    }
    if (!selectedRestaurantId) {
      return onFlash('Please select a restaurant.');
    }

    setLoading(true);
    try {
      const group = await api('/groups', {
        method: 'POST',
        body: { restaurantId: selectedRestaurantId }
      });
      // Fetch full populated group details
      const populated = await api(`/groups/${group.code}`);
      setCurrentGroup(populated);
      onFlash(`Group order created! Invite code: ${group.code}`);
    } catch (err) {
      onFlash(err.message || 'Failed to create group order');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (codeToJoin) => {
    const code = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!code) return onFlash('Please enter a 6-character invitation code');
    if (!auth) {
      onFlash('Please sign in to join this group order');
      onOpenAuth('login');
      return;
    }

    setLoading(true);
    try {
      await api('/groups/join', {
        method: 'POST',
        body: { code }
      });
      const group = await api(`/groups/${code}`);
      setCurrentGroup(group);
      onFlash(`Joined group order at ${group.restaurant?.name}!`);
    } catch (err) {
      onFlash(err.message || 'Group order not found or already closed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (food) => {
    if (!currentGroup?.code) return;
    try {
      await api(`/groups/${currentGroup.code}/items`, {
        method: 'POST',
        body: { foodId: food._id, quantity: 1 }
      });
      const updated = await api(`/groups/${currentGroup.code}`);
      setCurrentGroup(updated);
      onFlash(`Added ${food.name} to shared group cart`);
    } catch (err) {
      onFlash(err.message || 'Failed to add item to group');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!currentGroup?.code) return;
    try {
      await api(`/groups/${currentGroup.code}/items/${itemId}`, {
        method: 'DELETE'
      });
      const updated = await api(`/groups/${currentGroup.code}`);
      setCurrentGroup(updated);
      onFlash('Item removed from group cart');
    } catch (err) {
      onFlash(err.message || 'Failed to remove item');
    }
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/?group=${currentGroup.code}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    onFlash('Shareable invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(currentGroup.code);
    setCopied(true);
    onFlash(`Invite code ${currentGroup.code} copied!`);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCreatorCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutAddress.line1 || !checkoutAddress.city) {
      return onFlash('Please provide a delivery address.');
    }

    setCheckoutBusy(true);
    try {
      const order = await api(`/groups/${currentGroup.code}/checkout`, {
        method: 'POST',
        body: {
          address: checkoutAddress,
          paymentMethod: checkoutPayment
        }
      });
      setShowCheckoutModal(false);
      onFlash('Group order placed successfully!');
      onOrderSuccess(order);
    } catch (err) {
      onFlash(err.message || 'Group checkout failed');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const isCreator = currentGroup?.creator?._id === auth?.user?.id || currentGroup?.creator === auth?.user?.id;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-28">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#e6efe8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#195c45] mb-2.5">
          <Users size={14} />
          <span>Smart Group Ordering</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d]">
          Share the Table with Friends
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#66706b] max-w-2xl leading-relaxed">
          Order together with friends, roommates, or co-workers from one restaurant. Everyone adds their favorite dishes with individual attribution, and the host handles checkout.
        </p>
      </div>

      {!currentGroup ? (
        /* Setup / Join View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl">
          {/* Card 1: Start New Group */}
          <div className="rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-2xs space-y-4">
            <div>
              <span className="rounded-full bg-[#fdf1ec] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ef6b42]">
                Option A · Host
              </span>
              <h2 className="font-serif text-xl font-bold text-[#17211d] mt-1.5">
                Start a Group Order
              </h2>
              <p className="text-xs text-[#66706b] mt-0.5">
                Choose a restaurant and invite your friends with a unique 6-character code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1.5">
                Select Restaurant
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs font-semibold text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.cuisines?.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={loading}
              className="w-full rounded-xl bg-[#195c45] py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#124534] transition active:scale-98"
            >
              {loading ? 'Creating Group…' : 'Generate Group Session'}
            </button>
          </div>

          {/* Card 2: Join Existing Group */}
          <div className="rounded-2xl border border-[#e7e9e6] bg-white p-6 shadow-2xs space-y-4">
            <div>
              <span className="rounded-full bg-[#e6efe8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#195c45]">
                Option B · Friend
              </span>
              <h2 className="font-serif text-xl font-bold text-[#17211d] mt-1.5">
                Join with an Invite Code
              </h2>
              <p className="text-xs text-[#66706b] mt-0.5">
                Enter the code your friend shared to open the shared menu.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1.5">
                6-Digit Invitation Code
              </label>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. SAV7X9"
                maxLength={8}
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-sm font-mono uppercase tracking-widest outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>

            <button
              onClick={() => handleJoinGroup()}
              disabled={loading || !joinCodeInput.trim()}
              className="w-full rounded-xl border border-[#195c45] bg-white py-3 text-xs font-semibold text-[#195c45] hover:bg-[#195c45] hover:text-white transition active:scale-98"
            >
              {loading ? 'Joining…' : 'Join Group Table'}
            </button>
          </div>
        </div>
      ) : (
        /* Active Group Session View */
        <div className="space-y-6 animate-fade-in">
          {/* Group Banner / Invite Hub */}
          <div className="rounded-2xl bg-[#17211d] p-5 sm:p-7 text-white shadow-md border border-[#195c45]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Active Group Order
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                {currentGroup.restaurant?.name || 'Local Kitchen'}
              </h2>
              <p className="text-xs text-stone-300">
                Created by <span className="font-bold text-white">{currentGroup.creator?.name}</span> · {currentGroup.members?.length} diner(s) joined
              </p>
            </div>

            {/* Invite code callout */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
              <div className="text-left pr-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Share Code</p>
                <p className="font-mono text-xl font-bold tracking-widest text-[#ef6b42]">
                  {currentGroup.code}
                </p>
              </div>

              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#17211d] hover:bg-stone-100 transition shadow-2xs"
              >
                {copied ? <Check size={14} className="text-[#195c45]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 rounded-lg bg-[#ef6b42] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#dc5b34] transition shadow-2xs"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>

              <button
                onClick={() => setCurrentGroup(null)}
                className="text-xs text-stone-300 hover:text-white underline pl-1"
              >
                Exit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Menu Browser (Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-[#e7e9e6] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#17211d]">
                  Add Items from Menu
                </h3>
                <span className="text-xs text-[#66706b]">
                  {restaurantMenu.length} dishes available
                </span>
              </div>

              <div className="space-y-2.5">
                {restaurantMenu.map((food) => (
                  <div
                    key={food._id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7e9e6] bg-white p-3 shadow-2xs hover:border-[#195c45]/40 transition"
                  >
                    <img
                      src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                      alt={food.name}
                      className="h-14 w-14 rounded-xl object-cover border border-[#e7e9e6] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[#17211d] truncate">
                        {food.name}
                      </h4>
                      <p className="text-xs text-[#66706b] line-clamp-1 mt-0.5">
                        {food.description}
                      </p>
                      <span className="text-xs font-bold text-[#17211d] mt-0.5 block">
                        {formatMoney(food.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddItem(food)}
                      className="flex items-center gap-1 rounded-xl bg-[#195c45] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#124534] transition shrink-0 active:scale-95 shadow-2xs"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Shared Cart & Bill Split (Col 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e7e9e6]">
                  <h3 className="font-serif text-lg font-bold text-[#17211d]">
                    Shared Group Cart
                  </h3>
                  <span className="rounded-full bg-[#e6efe8] px-2.5 py-0.5 text-xs font-bold text-[#195c45]">
                    {currentGroup.items?.length || 0} items
                  </span>
                </div>

                {/* Items with Member Attribution */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-[#e7e9e6]">
                  {(!currentGroup.items || currentGroup.items.length === 0) ? (
                    <p className="text-xs text-[#66706b] italic py-6 text-center">
                      No items added yet. Click "+ Add" on any menu dish on the left.
                    </p>
                  ) : (
                    currentGroup.items.map((item) => {
                      const canDelete =
                        isCreator ||
                        item.addedBy?._id === auth?.user?.id ||
                        item.addedBy === auth?.user?.id;

                      return (
                        <div key={item._id} className="pt-2 flex items-start justify-between gap-3 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#17211d] truncate">
                                {item.quantity} × {item.name}
                              </span>
                              <span className="rounded-full bg-[#f7f6f1] px-2 py-0.2 text-[10px] font-semibold text-[#195c45] shrink-0 border border-[#e7e9e6]">
                                {item.addedByName}
                              </span>
                            </div>
                            <span className="text-[#66706b] text-[11px] mt-0.5 block">
                              {formatMoney(item.price)} each
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-[#17211d]">
                              {formatMoney(item.price * item.quantity)}
                            </span>
                            {canDelete && (
                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                className="text-[#66706b] hover:text-red-600 transition"
                                title="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Individual Member Breakdown (Transparent Splitting) */}
                {currentGroup.memberBreakdown?.length > 0 && (
                  <div className="rounded-xl bg-[#f7f6f1] border border-[#e7e9e6] p-3.5 space-y-1.5 text-xs">
                    <p className="font-bold text-[#17211d] uppercase tracking-wider text-[10px]">
                      Individual Diner Totals
                    </p>
                    {currentGroup.memberBreakdown.map((m) => (
                      <div key={m.userId} className="flex justify-between text-[#66706b]">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-semibold text-[#17211d]">
                          {formatMoney(m.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total & Checkout */}
                <div className="space-y-2 border-t border-[#e7e9e6] pt-3 text-xs text-[#66706b]">
                  <div className="flex justify-between">
                    <span>Combined Subtotal</span>
                    <span className="font-semibold text-[#17211d]">
                      {formatMoney(currentGroup.groupSubtotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-[#17211d]">
                      {formatMoney(currentGroup.deliveryFee || 2.5)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#17211d] pt-2 border-t border-[#e7e9e6]">
                    <span>Group Total</span>
                    <span>{formatMoney(currentGroup.groupTotal || 0)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                {isCreator ? (
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    disabled={!currentGroup.items?.length}
                    className="w-full rounded-xl bg-[#195c45] py-3 text-xs font-semibold text-white hover:bg-[#124534] transition disabled:opacity-60 shadow-xs"
                  >
                    Proceed to Group Checkout · {formatMoney(currentGroup.groupTotal || 0)}
                  </button>
                ) : (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-center text-xs text-amber-800">
                    Waiting for group creator (<span className="font-bold">{currentGroup.creator?.name}</span>) to finalize checkout.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e7e9e6]">
            <h3 className="font-serif text-lg font-bold text-[#17211d] mb-0.5">
              Finalize Group Order
            </h3>
            <p className="text-xs text-[#66706b] mb-4">
              You are ordering for {currentGroup.members?.length} members.
            </p>

            <form onSubmit={handleCreatorCheckout} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17211d] mb-1">
                  Delivery Street Address
                </label>
                <input
                  required
                  type="text"
                  value={checkoutAddress.line1}
                  onChange={(e) => setCheckoutAddress({ ...checkoutAddress, line1: e.target.value })}
                  placeholder="Street address"
                  className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#17211d] mb-1">City</label>
                  <input
                    required
                    type="text"
                    value={checkoutAddress.city}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, city: e.target.value })}
                    className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17211d] mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={checkoutAddress.postalCode}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, postalCode: e.target.value })}
                    className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17211d] mb-1">Payment</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCheckoutPayment('online')}
                    className={`rounded-xl border p-2 font-semibold transition ${
                      checkoutPayment === 'online' ? 'border-[#195c45] bg-[#e6efe8] text-[#195c45]' : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                    }`}
                  >
                    Online Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutPayment('cod')}
                    className={`rounded-xl border p-2 font-semibold transition ${
                      checkoutPayment === 'cod' ? 'border-[#195c45] bg-[#e6efe8] text-[#195c45]' : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e7e9e6] flex items-center justify-between text-sm font-bold text-[#17211d]">
                <span>Total Combined</span>
                <span>{formatMoney(currentGroup.groupTotal || 0)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 rounded-xl border border-[#e7e9e6] py-2.5 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={checkoutBusy}
                  className="flex-1 rounded-xl bg-[#195c45] py-2.5 text-xs font-semibold text-white hover:bg-[#124534] transition disabled:opacity-60 shadow-2xs"
                >
                  {checkoutBusy ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
