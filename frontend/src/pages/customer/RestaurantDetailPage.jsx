import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock3,
  MapPin,
  Phone,
  Heart,
  Users,
  Search,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import FoodCard from '../../components/customer/FoodCard.jsx';
import { FoodCardSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { api, formatMoney } from '../../services/api.js';

export default function RestaurantDetailPage({
  restaurant,
  onBack,
  cart,
  onUpdateCart,
  onClearCartAndAdd,
  onStartGroupOrder,
  isFavorite = false,
  onToggleFavorite,
  onFlash
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conflictItem, setConflictItem] = useState(null); // When user tries to add item from different restaurant

  // Save to recently viewed in localStorage
  useEffect(() => {
    if (!restaurant) return;
    try {
      const stored = JSON.parse(localStorage.getItem('savor_recently_viewed') || '[]');
      const filtered = stored.filter(r => r._id !== restaurant._id);
      filtered.unshift(restaurant);
      localStorage.setItem('savor_recently_viewed', JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {}
  }, [restaurant]);

  // Fetch full restaurant details, foods, and reviews
  useEffect(() => {
    if (!restaurant?._id) return;
    setLoading(true);
    api(`/restaurants/${restaurant._id}`)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        onFlash(err.message || 'Failed to load restaurant menu');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [restaurant]);

  if (!restaurant) return null;

  const currentCartRestaurantId = cart?.items?.[0]?.food?.restaurant?._id || cart?.items?.[0]?.food?.restaurant;
  const isCartFromDifferentRestaurant =
    cart?.items?.length > 0 &&
    currentCartRestaurantId &&
    currentCartRestaurantId.toString() !== restaurant._id.toString();

  const handleUpdateQuantity = (food, newQuantity, notes) => {
    if (newQuantity > 0 && isCartFromDifferentRestaurant) {
      setConflictItem({ food, quantity: newQuantity, notes });
      return;
    }
    onUpdateCart(food, newQuantity, notes);
  };

  const confirmReplaceCart = () => {
    if (conflictItem) {
      onClearCartAndAdd(conflictItem.food, conflictItem.quantity, conflictItem.notes);
      setConflictItem(null);
    }
  };

  const foods = data?.foods || [];
  const reviews = data?.reviews || [];
  const rest = data?.restaurant || restaurant;

  // Extract unique categories present in the menu
  const menuCategories = [];
  const catMap = new Map();
  foods.forEach((f) => {
    if (f.category && !catMap.has(f.category._id || f.category)) {
      catMap.set(f.category._id || f.category, f.category.name || 'Specialties');
      menuCategories.push({
        id: f.category._id || f.category,
        name: f.category.name || 'Specialties'
      });
    }
  });

  // Filter foods by active category and search query
  const filteredFoods = foods.filter((f) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (f.category?._id || f.category) === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (foodId) => {
    const item = cart?.items?.find((i) => (i.food?._id || i.food) === foodId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#195c45] transition"
        >
          <ArrowLeft size={16} />
          <span>Back to all restaurants</span>
        </button>
      </div>

      {/* Restaurant Hero Card */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 mt-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#17211d] text-white shadow-lg min-h-[280px] flex flex-col justify-end p-6 sm:p-9 border border-[#e7e9e6]/10">
          {/* Background image */}
          <img
            src={rest.coverImage || rest.image}
            alt={rest.name}
            className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          {/* Top action buttons */}
          <div className="relative z-10 mb-auto flex items-center justify-between pb-6">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              {rest.isOpen ? 'Open Now' : 'Closed for Orders'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartGroupOrder(rest)}
                className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white hover:text-[#17211d] transition"
              >
                <Users size={14} />
                <span>Group Order</span>
              </button>
              <button
                onClick={() => onToggleFavorite(rest._id)}
                aria-label="Save to favorites"
                className={`grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition ${
                  isFavorite
                    ? 'bg-red-50 text-red-500'
                    : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {rest.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-300 leading-relaxed">
              {rest.description || 'Artisanal kitchen preparing fresh daily menus.'}
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-300">
              {rest.cuisines?.join(' · ')}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-stone-200">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Star size={13} fill="currentColor" />
                <span>{rest.rating?.toFixed(1) || '4.8'}</span>
                <span className="text-stone-300 font-normal">
                  ({rest.numReviews || reviews.length} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock3 size={13} className="text-[#e6efe8]" />
                <span>{rest.deliveryTime || '25-35 min'}</span>
              </div>
              <div>
                Delivery {formatMoney(rest.deliveryFee || 2.5)}
              </div>
              {rest.address && (
                <div className="flex items-center gap-1 text-stone-300">
                  <MapPin size={12} />
                  <span>{rest.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Menu Sections (Col 8) */}
          <div className="lg:col-span-8">
            {/* Filter toolbar */}
            <div className="sticky top-20 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-2.5 shadow-xs border border-[#e7e9e6] mb-6 backdrop-blur-md">
              {/* Category pills */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                    activeCategory === 'all'
                      ? 'bg-[#195c45] text-white shadow-2xs'
                      : 'text-[#66706b] hover:bg-[#f7f6f1] hover:text-[#17211d]'
                  }`}
                >
                  Full Menu
                </button>
                {menuCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                      activeCategory === c.id
                        ? 'bg-[#195c45] text-white shadow-2xs'
                        : 'text-[#66706b] hover:bg-[#f7f6f1] hover:text-[#17211d]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* In-menu search */}
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[#66706b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dishes…"
                  className="w-full sm:w-48 rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] pl-8 pr-3 py-1.5 text-xs text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Menu Items List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <FoodCardSkeleton key={n} />
                ))}
              </div>
            ) : filteredFoods.length === 0 ? (
              <EmptyState
                title="No dishes found"
                description={
                  searchQuery
                    ? `No menu items match "${searchQuery}".`
                    : 'This category does not have any items listed at the moment.'
                }
              />
            ) : (
              <div className="space-y-4">
                {filteredFoods.map((food) => (
                  <FoodCard
                    key={food._id}
                    food={food}
                    quantity={getItemQuantity(food._id)}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Reviews & Kitchen Info (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Delivery Guarantee Info */}
            <div className="rounded-2xl border border-[#e7e9e6] bg-[#f7f6f1] p-5">
              <h3 className="font-serif text-base font-bold text-[#17211d]">
                Fresh Preparation Promise
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#66706b]">
                All dishes are prepared to order using local seasonal ingredients. Hot items are sealed in insulated packaging.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#195c45]">
                <ShieldCheck size={16} />
                <span>Verified Clean Kitchen</span>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="rounded-2xl border border-[#e7e9e6] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#e7e9e6]">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#17211d]">
                    Customer Reviews
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#66706b] mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star size={13} fill="currentColor" /> {rest.rating?.toFixed(1) || '4.8'}
                    </span>
                    <span>· {reviews.length} verified ratings</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#66706b] italic py-4 text-center">
                    No customer reviews yet. Be the first to order and review this kitchen!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-[#e7e9e6] pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17211d]">
                          {rev.customer?.name || 'Verified Diner'}
                        </span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="mt-1 text-xs text-[#66706b] leading-relaxed">
                          "{rev.comment}"
                        </p>
                      )}
                      <span className="text-[10px] text-[#66706b]/70 mt-1 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Conflict Modal */}
      {conflictItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e7e9e6]">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle size={22} />
              <h3 className="font-serif text-lg font-bold text-[#17211d]">
                Start a new cart?
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[#66706b]">
              Your cart currently contains dishes from another restaurant. Each order must come from a single kitchen to guarantee timely hot delivery.
            </p>
            <p className="mt-3 text-xs font-bold text-[#17211d]">
              Would you like to clear your existing cart and add <span className="text-[#195c45]">{conflictItem.food?.name}</span> from {restaurant.name}?
            </p>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setConflictItem(null)}
                className="rounded-xl border border-[#e7e9e6] px-4 py-2 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
              >
                Keep Existing Cart
              </button>
              <button
                onClick={confirmReplaceCart}
                className="rounded-xl bg-[#195c45] px-4 py-2 text-xs font-semibold text-white hover:bg-[#124534] transition shadow-2xs"
              >
                Clear & Add Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
