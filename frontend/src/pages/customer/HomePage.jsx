import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock3,
  Percent,
  Users,
  Star,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import RestaurantCard from '../../components/customer/RestaurantCard.jsx';
import { RestaurantCardSkeleton } from '../../components/common/LoadingSkeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';

export default function HomePage({
  onOpenRestaurant,
  onOpenRescue,
  onOpenGroup,
  onOpenSearch,
  onOpenLocation,
  currentLocation,
  favorites = [],
  onToggleFavorite,
  selectedCuisineFilter,
  onClearCuisineFilter
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCuisine, setSelectedCuisine] = useState(selectedCuisineFilter || '');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const DIETARY_OPTIONS = [
    { label: 'All Diets', value: 'All' },
    { label: 'Vegetarian', value: 'Vegetarian', icon: '🥬' },
    { label: 'Vegan', value: 'Vegan', icon: '🌱' },
    { label: 'Gluten-Free', value: 'Gluten-Free', icon: '🌾' },
    { label: 'Halal', value: 'Halal', icon: '✨' }
  ];

  useEffect(() => {
    if (selectedCuisineFilter) {
      setSelectedCuisine(selectedCuisineFilter);
    }
  }, [selectedCuisineFilter]);

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('savor_recently_viewed');
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 4));
    } catch (e) {}
  }, []);

  // Fetch categories
  useEffect(() => {
    api('/categories')
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch restaurants with current filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCuisine) params.append('cuisine', selectedCuisine);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedDietary && selectedDietary !== 'All') params.append('dietary', selectedDietary);
    if (sortBy) params.append('sort', sortBy);

    api(`/restaurants?${params.toString()}`)
      .then((data) => {
        setRestaurants(data);
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCuisine, selectedCategory, selectedDietary, sortBy]);

  const handleCategoryClick = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedCuisine('');
    setSortBy('rating');
    if (onClearCuisineFilter) onClearCuisineFilter();
  };

  const isFiltered = Boolean(selectedCategory || selectedCuisine || sortBy !== 'rating');

  return (
    <div className="pb-24">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden bg-[#f7f6f1] border-b border-[#e7e9e6] px-4 py-12 sm:py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-[#ef6b42] shadow-2xs border border-[#e7e9e6] mb-4">
                <Sparkles size={13} className="text-[#ef6b42]" />
                <span>Elevated Everyday Dining</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#17211d] leading-[1.18]">
                Your favourite food, <br />
                <span className="italic text-[#195c45]">delivered beautifully.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm sm:text-base text-[#66706b] leading-relaxed">
                Hand-selected local kitchens, slow-fermented Neapolitan pizzas, wild-caught salmon bowls, and warm artisan patisserie delivered to your doorstep in <span className="font-semibold text-[#17211d]">{currentLocation}</span>.
              </p>

              {/* Main Search Bar */}
              <div className="mt-7 flex max-w-xl items-center rounded-2xl border border-[#e7e9e6] bg-white p-2 shadow-xs hover:border-[#195c45]/40 transition">
                <button
                  onClick={onOpenSearch}
                  className="flex flex-1 items-center gap-3 px-3 text-left text-sm text-[#66706b]"
                >
                  <Search size={18} className="text-[#66706b]/70 shrink-0" />
                  <span className="truncate">Search dishes, kitchens or cuisines (e.g. truffle pizza, sushi)…</span>
                </button>
                <button
                  onClick={onOpenSearch}
                  className="rounded-xl bg-[#195c45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#124534] transition shrink-0 active:scale-95 shadow-xs"
                >
                  Explore
                </button>
              </div>

              {/* Quick perks pills */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-[#66706b]">
                <button
                  onClick={onOpenRescue}
                  className="flex items-center gap-1.5 rounded-full bg-[#fdf1ec] px-3.5 py-1.5 text-[#ef6b42] hover:bg-[#fbe3d8] transition border border-[#ef6b42]/25 font-semibold"
                >
                  <Percent size={13} />
                  <span>Food Rescue: 40-50% Off Surplus Today</span>
                </button>
                <button
                  onClick={onOpenGroup}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[#195c45] hover:bg-[#f7f6f1] transition border border-[#e7e9e6] font-medium"
                >
                  <Users size={13} />
                  <span>Smart Group Ordering</span>
                </button>
              </div>
            </div>

            {/* Right Hero Image Composition */}
            <div className="relative hidden lg:block lg:col-span-5">
              <div className="relative mx-auto h-[380px] w-[360px]">
                {/* Decorative border circle */}
                <div className="absolute inset-0 rounded-full border border-[#e7e9e6] scale-105" />
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"
                  alt="Fresh gourmet dish"
                  className="h-full w-full rounded-full object-cover border-[8px] border-white shadow-xl"
                />

                {/* Floating Perk Badge 1 */}
                <div className="absolute -bottom-3 -left-4 rounded-2xl bg-white p-3 shadow-md border border-[#e7e9e6] flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6efe8] text-[#195c45]">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17211d]">Fresh & Punctual</p>
                    <p className="text-[11px] text-[#66706b]">Average 28 min delivery</p>
                  </div>
                </div>

                {/* Floating Perk Badge 2 */}
                <div className="absolute top-4 -right-3 rounded-2xl bg-white p-2.5 shadow-md border border-[#e7e9e6] flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-bold text-xs">
                    ★
                  </span>
                  <div className="text-xs">
                    <p className="font-bold text-[#17211d]">4.9 Star Curation</p>
                    <p className="text-[11px] text-[#66706b]">Top verified kitchens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Container */}
      <main className="mx-auto max-w-7xl px-4 md:px-8 mt-10">
        {/* Special Promo Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17211d] to-[#195c45] p-5 sm:p-6 text-white border border-[#195c45]/30 shadow-xs mb-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <span className="rounded-full bg-[#ef6b42] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Limited Offer
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold">20% off your first culinary order</h3>
            <p className="text-xs text-stone-300 max-w-md">
              Use promo code <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">WELCOME20</span> at checkout on orders over $20.
            </p>
          </div>
          <button
            onClick={() => {
              window.scrollTo({ top: 750, behavior: 'smooth' });
            }}
            className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#195c45] hover:bg-[#f7f6f1] transition shrink-0 active:scale-95 shadow-xs"
          >
            Order Now
          </button>
        </div>

        {/* Categories Carousel */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
                CURATED SELECTION
              </p>
              <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#17211d] mt-1">
                What are you craving?
              </h2>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-semibold text-[#195c45] hover:underline"
              >
                Clear category
              </button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`flex flex-col items-center min-w-[86px] sm:min-w-[96px] rounded-2xl p-3 text-center transition-all duration-200 border ${
                    isSelected
                      ? 'border-[#195c45] bg-[#e6efe8] shadow-xs'
                      : 'border-[#e7e9e6] bg-white hover:border-[#195c45]/40 hover:bg-[#f7f6f1]'
                  }`}
                >
                  <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-[#f7f6f1] text-2xl sm:text-3xl mb-2 transition group-hover:scale-105">
                    {cat.image || '🍽️'}
                  </span>
                  <span
                    className={`text-xs leading-tight ${
                      isSelected ? 'font-bold text-[#195c45]' : 'font-medium text-[#17211d]'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recently Viewed (if available) */}
        {recentlyViewed.length > 0 && !selectedCategory && !selectedCuisine && (
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
              JUMP BACK IN
            </p>
            <h3 className="font-serif text-xl font-bold text-[#17211d] mt-1 mb-4">
              Recently Viewed
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((rest) => (
                <RestaurantCard
                  key={`recent-${rest._id}`}
                  restaurant={rest}
                  onOpen={onOpenRestaurant}
                  isFavorite={favorites.includes(rest._id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Header & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#e7e9e6] pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
              NEAR YOU
            </p>
            <h2 className="font-serif text-2xl sm:text-[26px] font-bold text-[#17211d] mt-1">
              Local Kitchens & Favourites
            </h2>
            {/* Dietary Preference Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none">
              <span className="text-[11px] font-semibold text-[#66706b] uppercase tracking-wider shrink-0 mr-1">Diet:</span>
              {DIETARY_OPTIONS.map((opt) => {
                const active = selectedDietary === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDietary(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 border ${
                      active
                        ? 'bg-[#195c45] text-white border-[#195c45] shadow-2xs'
                        : 'bg-white text-[#66706b] border-[#e7e9e6] hover:border-stone-300 hover:bg-[#f7f6f1]'
                    }`}
                  >
                    {opt.icon && <span>{opt.icon}</span>}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort & Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cuisine Selector */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="rounded-xl border border-[#e7e9e6] bg-white px-3 py-1.5 text-xs font-medium text-[#17211d] outline-none focus:border-[#195c45] focus:ring-1 focus:ring-[#195c45]/20"
            >
              <option value="">All Cuisines</option>
              <option value="Italian">Italian & Pizza</option>
              <option value="Healthy">Healthy & Bowls</option>
              <option value="Burgers">Burgers & American</option>
              <option value="Japanese">Japanese & Sushi</option>
              <option value="Bakery">Bakery & Sweets</option>
              <option value="Indian">Indian Curries</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#e7e9e6] bg-white px-3 py-1.5 text-xs font-medium text-[#17211d] outline-none focus:border-[#195c45] focus:ring-1 focus:ring-[#195c45]/20"
            >
              <option value="rating">Top Rated (Highest)</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-xl border border-[#e7e9e6] bg-[#f7f6f1] px-3 py-1.5 text-xs font-medium text-[#66706b] hover:bg-stone-200/60 transition"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <RestaurantCardSkeleton key={n} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              title="No kitchens found"
              description="No restaurants match your active filter criteria. Try resetting your filters to see all available kitchens."
              actionText="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {restaurants.map((rest) => (
                <RestaurantCard
                  key={rest._id}
                  restaurant={rest}
                  onOpen={onOpenRestaurant}
                  isFavorite={favorites.includes(rest._id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
