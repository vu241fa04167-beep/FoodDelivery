import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  DollarSign,
  Check,
  X,
  Plus,
  Trash2,
  Tag,
  RotateCw,
  Percent,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { api, formatMoney } from '../../services/api.js';

export default function AdminDashboardPage({ auth, onFlash }) {
  const [tab, setTab] = useState('restaurants'); // 'restaurants' | 'orders' | 'users' | 'categories' | 'coupons'
  const [overview, setOverview] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category Form
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', image: '🍽️' });

  // New Coupon Form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'fixed',
    discountValue: '',
    minOrder: '20',
    description: ''
  });

  const loadAllAdminData = async () => {
    try {
      const [dash, restList, ordersList, usersList, catList, coupList] = await Promise.all([
        api('/admin/dashboard').catch(() => null),
        api('/admin/restaurants').catch(() => []),
        api('/admin/orders').catch(() => []),
        api('/admin/users').catch(() => []),
        api('/admin/categories').catch(() => []),
        api('/admin/coupons').catch(() => [])
      ]);

      if (dash) setOverview(dash);
      setRestaurants(restList || []);
      setOrders(ordersList || []);
      setUsers(usersList || []);
      setCategories(catList || []);
      setCoupons(coupList || []);
    } catch (err) {
      console.error('Admin load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Toggle restaurant approval
  const handleToggleApproveRestaurant = async (restaurant) => {
    try {
      await api(`/admin/restaurants/${restaurant._id}`, {
        method: 'PATCH',
        body: { approved: !restaurant.approved }
      });
      onFlash(`Restaurant ${!restaurant.approved ? 'Approved' : 'Suspended'}`);
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Approval action failed');
    }
  };

  // Admin order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api(`/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: { status: newStatus, note: 'Updated by Platform Admin' }
      });
      onFlash(`Order updated to ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Failed to update order');
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/categories', {
        method: 'POST',
        body: catForm
      });
      setShowCatModal(false);
      setCatForm({ name: '', image: '🍽️' });
      onFlash('Category added');
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Failed to add category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api(`/admin/categories/${catId}`, { method: 'DELETE' });
      onFlash('Category removed');
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Failed to delete category');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: {
          code: couponForm.code.toUpperCase(),
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          minOrder: Number(couponForm.minOrder || 0),
          description: couponForm.description
        }
      });
      setShowCouponModal(false);
      setCouponForm({ code: '', discountType: 'fixed', discountValue: '', minOrder: '20', description: '' });
      onFlash('Promo coupon created');
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Failed to create coupon');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api(`/admin/coupons/${id}`, { method: 'DELETE' });
      onFlash('Coupon deleted');
      loadAllAdminData();
    } catch (err) {
      onFlash(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e9e6] pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#195c45] mb-1">
            <LayoutDashboard size={15} />
            <span>Savor Platform Administration</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d]">
            Operations & Platform Control
          </h1>
          <p className="text-xs text-[#66706b] mt-0.5">
            Monitor orders, approve kitchens, curate categories, and oversee promo codes.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="flex items-center gap-1.5 rounded-xl border border-[#e7e9e6] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
        >
          <RotateCw size={13} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-6">
        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Platform GMV</p>
          <p className="mt-2 text-2xl font-bold text-[#195c45] font-serif">
            {formatMoney(overview?.revenue || 0)}
          </p>
          <span className="text-[11px] text-[#66706b]">Delivered revenue</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Total Orders</p>
          <p className="mt-2 text-2xl font-bold text-[#17211d] font-serif">
            {overview?.orders || orders.length}
          </p>
          <span className="text-[11px] text-[#66706b]">All-time customer orders</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Restaurants</p>
          <p className="mt-2 text-2xl font-bold text-[#17211d] font-serif">
            {overview?.restaurants || restaurants.length}
          </p>
          <span className="text-[11px] text-[#66706b]">Partner kitchens</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Pending Review</p>
          <p className="mt-2 text-2xl font-bold text-[#ef6b42] font-serif">
            {overview?.pendingRestaurants || restaurants.filter(r => !r.approved).length}
          </p>
          <span className="text-[11px] text-[#66706b]">Awaiting approval</span>
        </div>

        <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66706b]">Customers</p>
          <p className="mt-2 text-2xl font-bold text-[#17211d] font-serif">
            {overview?.customers || users.filter(u => u.role === 'customer').length}
          </p>
          <span className="text-[11px] text-[#66706b]">Registered food lovers</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e7e9e6] pb-3 mb-6 overflow-x-auto">
        {[
          { key: 'restaurants', label: 'Kitchen Approvals', badge: restaurants.filter(r => !r.approved).length },
          { key: 'orders', label: 'Orders Monitor', badge: orders.length },
          { key: 'users', label: 'User Accounts', badge: users.length },
          { key: 'categories', label: 'Food Categories', badge: categories.length },
          { key: 'coupons', label: 'Promo Coupons', badge: coupons.length }
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
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === t.key ? 'bg-white text-[#195c45]' : 'bg-[#e7e9e6] text-[#17211d]'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: RESTAURANTS */}
      {tab === 'restaurants' && (
        <div className="rounded-2xl border border-[#e7e9e6] bg-white shadow-2xs divide-y divide-[#e7e9e6] overflow-hidden animate-fade-in">
          {restaurants.map((rest) => (
            <div key={rest._id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={rest.image}
                  alt={rest.name}
                  className="h-14 w-14 rounded-xl object-cover border border-[#e7e9e6] shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#17211d]">{rest.name}</h4>
                  <p className="text-xs text-[#66706b]">
                    {rest.cuisines?.join(' · ')} · {rest.city} · Rating: ★ {rest.rating}
                  </p>
                  <p className="text-[11px] text-[#66706b] mt-0.5">
                    Owner: {rest.owner?.name} ({rest.owner?.email})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                    rest.approved ? 'bg-[#e6efe8] text-[#195c45]' : 'bg-[#fdf1ec] text-[#ef6b42]'
                  }`}
                >
                  {rest.approved ? 'Approved & Live' : 'Pending Review'}
                </span>

                <button
                  onClick={() => handleToggleApproveRestaurant(rest)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition shadow-2xs ${
                    rest.approved
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'bg-[#195c45] text-white hover:bg-[#124534]'
                  }`}
                >
                  {rest.approved ? 'Suspend Kitchen' : 'Approve Kitchen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ORDERS MONITOR */}
      {tab === 'orders' && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs divide-y divide-stone-100 overflow-hidden animate-fade-in">
          {orders.map((o) => (
            <div key={o._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-stone-400">
                  #{o._id.slice(-6).toUpperCase()}
                </span>
                <p className="font-bold text-stone-900 mt-0.5">
                  {o.restaurant?.name || 'Kitchen'} · {o.customer?.name} ({o.customer?.email})
                </p>
                <p className="text-stone-500 mt-0.5">
                  {o.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-bold text-stone-900 text-sm">
                  {formatMoney(o.total)}
                </span>

                <select
                  value={o.status}
                  onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-800 outline-none"
                >
                  {['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS */}
      {tab === 'users' && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-xs divide-y divide-stone-100 overflow-hidden animate-fade-in">
          {users.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-stone-900 text-sm">{u.name}</p>
                <p className="text-stone-500">{u.email} · {u.phone || 'No phone'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'restaurant'
                      ? 'bg-[#fef0eb] text-[#ef6b42]'
                      : 'bg-[#e5f0d9] text-[#195c45]'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {tab === 'categories' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-[#17211d]">
              Food Categories
            </h3>
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#195c45] px-4 py-2 text-xs font-bold text-white hover:bg-[#124534]"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-xs flex flex-col items-center justify-between"
              >
                <span className="text-4xl mb-2">{c.image || '🍽️'}</span>
                <span className="text-xs font-bold text-stone-800">{c.name}</span>
                <button
                  onClick={() => handleDeleteCategory(c._id)}
                  className="mt-3 text-[11px] text-stone-400 hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS */}
      {tab === 'coupons' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#17211d]">
                Promo Codes & Vouchers
              </h3>
              <p className="text-xs text-stone-500">
                Create promotional discount codes for diners.
              </p>
            </div>
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#ef6b42] px-4 py-2 text-xs font-bold text-white hover:bg-[#dc5b34]"
            >
              <Plus size={14} />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {coupons.map((coup) => (
              <div
                key={coup._id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-base font-bold text-[#195c45] bg-[#e5f0d9]/60 px-2 py-0.5 rounded">
                    {coup.code}
                  </span>
                  <button
                    onClick={() => handleDeleteCoupon(coup._id)}
                    className="text-stone-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  {coup.discountType === 'percent'
                    ? `${coup.discountValue}% off`
                    : `${formatMoney(coup.discountValue)} off`}
                </p>
                <p className="text-[11px] text-stone-500">{coup.description || `Min order: ${formatMoney(coup.minOrder)}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-lg font-bold text-[#17211d] mb-3">Add Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Pasta, Tacos..."
                  className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Emoji / Icon</label>
                <input
                  required
                  type="text"
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  placeholder="🍕"
                  className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none text-2xl text-center"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#195c45] py-2 text-xs font-bold text-white hover:bg-[#124534]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-lg font-bold text-[#17211d] mb-3">Create Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Promo Code</label>
                <input
                  required
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVOR15"
                  className="w-full rounded-xl border border-stone-300 p-2 text-xs font-mono uppercase outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none"
                  >
                    <option value="fixed">Fixed ($)</option>
                    <option value="percent">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Value</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Min Order ($)</label>
                <input
                  type="number"
                  value={couponForm.minOrder}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="$10 off orders over $25"
                  className="w-full rounded-xl border border-stone-300 p-2 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#ef6b42] py-2 text-xs font-bold text-white hover:bg-[#dc5b34]"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
