import React, { useState, useEffect } from 'react';
import {
  Store,
  ShoppingBag,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCw,
  Percent,
  Sparkles,
  ChefHat,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api, formatMoney } from '../../services/api.js';

export default function RestaurantDashboardPage({ auth, onFlash }) {
  const [tab, setTab] = useState('orders'); // 'orders' | 'menu' | 'rescue' | 'profile' | 'stats'
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [rescueListings, setRescueListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Food Modal Form state
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    dietary: []
  });

  // Food Rescue Form state
  const [showAddRescueModal, setShowAddRescueModal] = useState(false);
  const [rescueForm, setRescueForm] = useState({
    foodId: '',
    discountedPrice: '',
    quantity: '5',
    description: 'Surplus portion prepared fresh today.'
  });

  // Order filter
  const [orderFilter, setOrderFilter] = useState('all');

  const loadData = async () => {
    try {
      const [statsRes, profileRes, ordersRes, foodsRes, rescueRes, catRes] = await Promise.all([
        api('/restaurant/stats').catch(() => null),
        api('/restaurant/profile').catch(() => null),
        api('/restaurant/orders').catch(() => []),
        api('/restaurant/foods').catch(() => []),
        api('/restaurant/rescue').catch(() => []),
        api('/categories').catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (profileRes) setProfile(profileRes);
      setOrders(ordersRes || []);
      setFoods(foodsRes || []);
      setRescueListings(rescueRes || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Restaurant data error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-poll orders every 4 seconds
    const interval = setInterval(() => {
      api('/restaurant/orders')
        .then((res) => setOrders(res || []))
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api(`/restaurant/orders/${orderId}`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      onFlash(`Order updated to ${newStatus.replace(/_/g, ' ')}`);
      loadData();
    } catch (err) {
      onFlash(err.message || 'Failed to update order status');
    }
  };

  // Toggle food availability
  const handleToggleFoodAvailability = async (food) => {
    try {
      await api(`/restaurant/foods/${food._id}`, {
        method: 'PATCH',
        body: { isAvailable: !food.isAvailable }
      });
      onFlash(`${food.name} is now ${!food.isAvailable ? 'available' : 'unavailable'}`);
      loadData();
    } catch (err) {
      onFlash(err.message || 'Failed to update menu item');
    }
  };

  // Delete food item
  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      await api(`/restaurant/foods/${foodId}`, {
        method: 'DELETE'
      });
      onFlash('Dish deleted from menu');
      loadData();
    } catch (err) {
      onFlash(err.message || 'Failed to delete dish');
    }
  };

  // Save (Create or Edit) Food
  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: foodForm.name,
        description: foodForm.description,
        price: Number(foodForm.price),
        image: foodForm.image,
        category: foodForm.category || (categories[0]?._id),
        dietary: foodForm.dietary
      };

      if (editingFood) {
        await api(`/restaurant/foods/${editingFood._id}`, {
          method: 'PATCH',
          body: payload
        });
        onFlash('Dish updated successfully');
      } else {
        await api('/restaurant/foods', {
          method: 'POST',
          body: payload
        });
        onFlash('New dish added to your menu');
      }

      setShowAddFoodModal(false);
      setEditingFood(null);
      setFoodForm({ name: '', description: '', price: '', image: '', category: '', dietary: [] });
      loadData();
    } catch (err) {
      onFlash(err.message || 'Failed to save menu dish');
    }
  };

  // Create Food Rescue Listing
  const handleCreateRescue = async (e) => {
    e.preventDefault();
    try {
      await api('/restaurant/rescue', {
        method: 'POST',
        body: {
          foodId: rescueForm.foodId,
          discountedPrice: Number(rescueForm.discountedPrice),
          quantity: Number(rescueForm.quantity),
          description: rescueForm.description
        }
      });
      onFlash('Surplus food rescue batch published!');
      setShowAddRescueModal(false);
      setRescueForm({
        foodId: '',
        discountedPrice: '',
        quantity: '5',
        description: 'Surplus portion prepared fresh today.'
      });
      loadData();
    } catch (err) {
      onFlash(err.message || 'Failed to create food rescue listing');
    }
  };

  // Save Restaurant Profile Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api('/restaurant/profile', {
        method: 'PUT',
        body: profile
      });
      setProfile(updated);
      onFlash('Restaurant details updated successfully');
    } catch (err) {
      onFlash(err.message || 'Failed to save profile');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return ['placed', 'accepted', 'preparing', 'out_for_delivery'].includes(o.status);
    return o.status === orderFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-28">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e9e6] pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ef6b42] mb-1">
            <Store size={15} />
            <span>Kitchen Management Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d]">
            {profile?.name || "Kitchen Operations"}
          </h1>
          <p className="text-xs text-[#66706b] mt-0.5">
            {profile?.address} · {profile?.approved ? 'Active & Approved' : 'Awaiting Platform Approval'}
          </p>
        </div>

        {/* Open / Closed Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (!profile) return;
              try {
                const updated = await api('/restaurant/profile', {
                  method: 'PUT',
                  body: { isOpen: !profile.isOpen }
                });
                setProfile(updated);
                onFlash(`Kitchen is now ${updated.isOpen ? 'OPEN' : 'CLOSED'}`);
              } catch (e) {}
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-2xs ${
              profile?.isOpen
                ? 'bg-[#195c45] text-white hover:bg-[#124534]'
                : 'bg-[#f7f6f1] border border-[#e7e9e6] text-[#66706b] hover:bg-stone-200/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${profile?.isOpen ? 'bg-green-300' : 'bg-[#66706b]'}`} />
            <span>{profile?.isOpen ? 'Kitchen Open (Accepting Orders)' : 'Kitchen Closed'}</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-[#e7e9e6] hover:bg-[#f7f6f1] text-[#66706b] transition"
            title="Refresh dashboard"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-[#195c45] font-serif">
            {formatMoney(stats?.revenue || 0)}
          </p>
          <span className="text-[11px] text-[#66706b] mt-1 block">From delivered meals</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Completed Orders</p>
          <p className="mt-2 text-2xl font-bold text-[#17211d] font-serif">
            {stats?.deliveredOrdersCount || 0}
          </p>
          <span className="text-[11px] text-[#66706b] mt-1 block">Successfully fulfilled</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Active In-Kitchen</p>
          <p className="mt-2 text-2xl font-bold text-[#ef6b42] font-serif">
            {stats?.pendingOrders || 0}
          </p>
          <span className="text-[11px] text-[#66706b] mt-1 block">Cooking or en route</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Menu Items</p>
          <p className="mt-2 text-2xl font-bold text-[#17211d] font-serif">
            {foods.length}
          </p>
          <span className="text-[11px] text-[#66706b] mt-1 block">Active dishes</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-[#e7e9e6] pb-3 mb-6 overflow-x-auto">
        {[
          { key: 'orders', label: 'Incoming Orders', badge: orders.filter(o => o.status === 'placed').length },
          { key: 'menu', label: 'Menu Dishes', badge: foods.length },
          { key: 'rescue', label: 'Food Rescue Listings', badge: rescueListings.length },
          { key: 'profile', label: 'Restaurant Settings' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shrink-0 ${
              tab === t.key
                ? 'bg-[#195c45] text-white shadow-2xs'
                : 'text-[#66706b] hover:bg-[#f7f6f1] hover:text-[#17211d]'
            }`}
          >
            <span>{t.label}</span>
            {Boolean(t.badge) && (
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === t.key ? 'bg-white text-[#195c45]' : 'bg-[#ef6b42] text-white'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: INCOMING ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-5 animate-fade-in">
          {/* Order status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'pending', 'placed', 'preparing', 'out_for_delivery', 'delivered'].map((f) => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  orderFilter === f
                    ? 'bg-[#17211d] text-white'
                    : 'bg-[#f7f6f1] border border-[#e7e9e6] text-[#66706b] hover:bg-stone-200/50'
                }`}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-[#66706b] text-xs italic">
              No orders found for current filter. New customer orders will appear automatically.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filteredOrders.map((order) => {
                const isPlaced = order.status === 'placed';
                const isAccepted = order.status === 'accepted';
                const isPreparing = order.status === 'preparing';
                const isOut = order.status === 'out_for_delivery';
                const isDelivered = order.status === 'delivered';

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#66706b]">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <h4 className="font-bold text-sm text-[#17211d]">
                          {order.customer?.name || 'Customer'}
                        </h4>
                        <p className="text-xs text-[#66706b]">
                          {order.customer?.phone || order.deliveryAddress?.phone || 'No phone'}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          isDelivered
                            ? 'bg-[#e6efe8] text-[#195c45]'
                            : isPlaced
                            ? 'bg-[#fdf1ec] text-[#ef6b42]'
                            : 'bg-amber-50 border border-amber-200 text-amber-900'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl bg-[#f7f6f1] border border-[#e7e9e6] p-3 text-xs space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            <b>{item.quantity}×</b> {item.name}
                          </span>
                          <span className="font-semibold text-[#17211d]">
                            {formatMoney(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.deliveryInstructions && (
                        <p className="text-[11px] italic text-[#195c45] pt-1 border-t border-[#e7e9e6] mt-1">
                          Note: {order.deliveryInstructions}
                        </p>
                      )}
                    </div>

                    {/* Delivery Address & Time */}
                    <div className="text-xs text-[#66706b] space-y-0.5">
                      <p className="font-semibold text-[#17211d]">
                        Deliver to: {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
                      </p>
                      <p className="text-[11px] text-[#66706b]">
                        Placed at: {new Date(order.createdAt).toLocaleTimeString()} · Total: <b>{formatMoney(order.total)}</b> ({order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'})
                      </p>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-2 border-t border-[#e7e9e6] flex flex-wrap gap-2">
                      {isPlaced && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                            className="flex-1 rounded-xl bg-[#195c45] py-2 text-xs font-semibold text-white hover:bg-[#124534] shadow-2xs"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'rejected')}
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                          className="w-full rounded-xl bg-[#195c45] py-2 text-xs font-semibold text-white hover:bg-[#124534] shadow-2xs"
                        >
                          Start Cooking
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'out_for_delivery')}
                          className="w-full rounded-xl bg-[#ef6b42] py-2 text-xs font-semibold text-white hover:bg-[#dc5b34] shadow-2xs"
                        >
                          Dispatch with Courier
                        </button>
                      )}

                      {isOut && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                          className="w-full rounded-xl bg-[#195c45] py-2 text-xs font-bold text-white hover:bg-[#124534]"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {isDelivered && (
                        <span className="flex items-center gap-1.5 text-xs text-[#195c45] font-bold">
                          <CheckCircle2 size={15} />
                          <span>Order completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU DISHES */}
      {tab === 'menu' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-[#17211d]">
              Menu Catalogue
            </h3>
            <button
              onClick={() => {
                setEditingFood(null);
                setFoodForm({ name: '', description: '', price: '', image: '', category: categories[0]?._id || '', dietary: [] });
                setShowAddFoodModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#195c45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#124534] transition shadow-xs"
            >
              <Plus size={15} />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <div
                key={food._id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
                    <img
                      src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                      alt={food.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        food.isAvailable
                          ? 'bg-green-700 text-white'
                          : 'bg-stone-800 text-white'
                      }`}
                    >
                      {food.isAvailable ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#17211d]">
                    {food.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {food.description}
                  </p>
                  <p className="text-sm font-bold text-[#195c45] mt-2">
                    {formatMoney(food.price)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleFoodAvailability(food)}
                    className="text-xs font-semibold text-stone-600 hover:text-[#195c45]"
                  >
                    {food.isAvailable ? 'Mark Unavailable' : 'Make Available'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFood(food);
                        setFoodForm({
                          name: food.name,
                          description: food.description || '',
                          price: food.price.toString(),
                          image: food.image || '',
                          category: food.category?._id || food.category || '',
                          dietary: food.dietary || []
                        });
                        setShowAddFoodModal(true);
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-700"
                      title="Edit dish"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food._id)}
                      className="p-1.5 text-stone-400 hover:text-red-600"
                      title="Delete dish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FOOD RESCUE MANAGEMENT */}
      {tab === 'rescue' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#17211d]">
                Food Rescue Listings
              </h3>
              <p className="text-xs text-stone-500">
                List kitchen surplus at discounted rates before closing.
              </p>
            </div>
            <button
              onClick={() => setShowAddRescueModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#ef6b42] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#dc5b34] transition shadow-xs"
            >
              <Plus size={15} />
              <span>List Surplus Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rescueListings.map((l) => (
              <div
                key={l._id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ef6b42]">
                      Food Rescue
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#17211d]">
                      {l.name}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      l.quantity > 0 ? 'bg-[#e5f0d9] text-[#195c45]' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {l.quantity} portions left
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <del className="text-stone-400 font-medium">
                    {formatMoney(l.originalPrice)}
                  </del>
                  <span className="text-base font-bold text-[#195c45]">
                    {formatMoney(l.discountedPrice)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-500">
                  <span>Status: {l.isAvailable && l.quantity > 0 ? 'Live in Marketplace' : 'Sold Out'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANT PROFILE & SETTINGS */}
      {tab === 'profile' && profile && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-3xl border border-stone-200 bg-white p-7 shadow-xs space-y-4 animate-fade-in">
          <h3 className="font-serif text-xl font-bold text-[#17211d] pb-2 border-b border-stone-100">
            Kitchen Information & Settings
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Restaurant Name</label>
            <input
              required
              type="text"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Cuisines (comma separated)</label>
            <input
              type="text"
              value={Array.isArray(profile.cuisines) ? profile.cuisines.join(', ') : profile.cuisines || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  cuisines: e.target.value.split(',').map((x) => x.trim())
                })
              }
              placeholder="Italian, Pizza, Artisan"
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Time</label>
              <input
                type="text"
                value={profile.deliveryTime || ''}
                onChange={(e) => setProfile({ ...profile, deliveryTime: e.target.value })}
                placeholder="25-35 min"
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Fee ($)</label>
              <input
                type="number"
                step="0.1"
                value={profile.deliveryFee ?? 2.5}
                onChange={(e) => setProfile({ ...profile, deliveryFee: Number(e.target.value) })}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Street Address</label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={profile.coverImage || profile.image || ''}
              onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#195c45] py-3 text-xs font-bold text-white hover:bg-[#124534] transition shadow-xs mt-2"
          >
            Save Restaurant Changes
          </button>
        </form>
      )}

      {/* MODAL: ADD / EDIT FOOD ITEM */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#17211d]">
                {editingFood ? 'Edit Dish' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setShowAddFoodModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Dish Name *</label>
                <input
                  required
                  type="text"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Burrata & Fig Salad"
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Ingredients and culinary notes..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price ($) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    placeholder="15.50"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Photo URL</label>
                <input
                  type="text"
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#195c45] py-2.5 text-xs font-bold text-white hover:bg-[#124534] shadow-xs"
                >
                  {editingFood ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RESCUE LISTING */}
      {showAddRescueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-[#17211d]">
                List Food Rescue Surplus
              </h3>
              <button
                onClick={() => setShowAddRescueModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRescue} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Menu Item</label>
                <select
                  required
                  value={rescueForm.foodId}
                  onChange={(e) => {
                    const selected = foods.find((f) => f._id === e.target.value);
                    setRescueForm({
                      ...rescueForm,
                      foodId: e.target.value,
                      discountedPrice: selected ? (selected.price * 0.6).toFixed(2) : ''
                    });
                  }}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                >
                  <option value="">Select dish…</option>
                  {foods.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} (Regular: {formatMoney(f.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Discounted Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={rescueForm.discountedPrice}
                    onChange={(e) => setRescueForm({ ...rescueForm, discountedPrice: e.target.value })}
                    placeholder="8.50"
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Available Portions</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="50"
                    value={rescueForm.quantity}
                    onChange={(e) => setRescueForm({ ...rescueForm, quantity: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Surplus Note</label>
                <input
                  type="text"
                  value={rescueForm.description}
                  onChange={(e) => setRescueForm({ ...rescueForm, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs outline-none focus:border-[#195c45]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRescueModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#ef6b42] py-2.5 text-xs font-bold text-white hover:bg-[#dc5b34] shadow-xs"
                >
                  Publish Surplus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
