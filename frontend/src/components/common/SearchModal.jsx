import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Store, Utensils, ArrowRight } from 'lucide-react';
import { api, formatMoney } from '../../services/api.js';

export default function SearchModal({
  isOpen,
  onClose,
  onSelectRestaurant,
  onSelectCuisine
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ restaurants: [], foods: [], cuisines: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSuggestions({ restaurants: [], foods: [], cuisines: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions({ restaurants: [], foods: [], cuisines: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api(`/restaurants/suggestions?q=${encodeURIComponent(query.trim())}`);
        setSuggestions(data);
      } catch (err) {
        console.error('Suggestion lookup failed', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    suggestions.restaurants.length > 0 ||
    suggestions.foods.length > 0 ||
    suggestions.cuisines.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-[#e7e9e6] overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[#e7e9e6] px-5 py-3.5 bg-[#fbfaf7]">
          <Search className="h-5 w-5 text-[#66706b] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, dishes (e.g. truffle pizza, nigiri, burger)..."
            className="w-full bg-transparent pl-3 pr-10 text-sm outline-none placeholder:text-[#66706b]/70 font-medium text-[#17211d]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#eceae2] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Suggestions Results */}
        <div className="max-h-[65vh] overflow-y-auto p-5 divide-y divide-[#e7e9e6]">
          {loading && (
            <div className="py-8 text-center text-sm text-[#66706b]">
              Searching kitchens and menus…
            </div>
          )}

          {!loading && query.trim().length >= 2 && !hasResults && (
            <div className="py-10 text-center text-sm text-[#66706b]">
              No matching restaurants or dishes found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#66706b] mb-3">Trending Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Truffle Mushroom Pizza', 'Tokyo Salmon Set', 'Organic Bowls', 'Craft Burgers', 'Matcha'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-full bg-[#f7f6f1] border border-[#e7e9e6] px-3.5 py-1.5 text-xs font-medium text-[#17211d] hover:bg-[#e6efe8] hover:text-[#195c45] transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Cuisines */}
          {suggestions.cuisines.length > 0 && (
            <div className="py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#66706b] mb-2">Cuisines</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.cuisines.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      onSelectCuisine(c);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e7e9e6] bg-white px-3 py-1.5 text-xs font-semibold text-[#195c45] hover:border-[#195c45] hover:bg-[#e6efe8] transition"
                  >
                    <span>{c}</span>
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Restaurants */}
          {suggestions.restaurants.length > 0 && (
            <div className="py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#66706b] mb-3">Kitchens & Restaurants</p>
              <div className="space-y-1.5">
                {suggestions.restaurants.map(r => (
                  <button
                    key={r._id}
                    onClick={() => {
                      onSelectRestaurant(r);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3.5 rounded-xl p-2.5 text-left hover:bg-[#f7f6f1] transition group"
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-12 w-12 rounded-lg object-cover border border-[#e7e9e6] group-hover:scale-102 transition duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[#17211d] group-hover:text-[#195c45] transition truncate">
                        {r.name}
                      </h4>
                      <p className="text-xs text-[#66706b] truncate">
                        {r.cuisines?.join(' · ')}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      ★ {r.rating}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Foods */}
          {suggestions.foods.length > 0 && (
            <div className="py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#66706b] mb-3">Menu Dishes</p>
              <div className="space-y-1.5">
                {suggestions.foods.map(f => (
                  <button
                    key={f._id}
                    onClick={() => {
                      if (f.restaurant) {
                        onSelectRestaurant(f.restaurant);
                        onClose();
                      }
                    }}
                    className="flex w-full items-center gap-3.5 rounded-xl p-2.5 text-left hover:bg-[#f7f6f1] transition group"
                  >
                    <img
                      src={f.image}
                      alt={f.name}
                      className="h-12 w-12 rounded-lg object-cover border border-[#e7e9e6] group-hover:scale-102 transition duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[#17211d] group-hover:text-[#195c45] transition truncate">
                        {f.name}
                      </h4>
                      <p className="text-xs text-[#66706b] truncate">
                        {f.restaurant?.name || 'Artisanal Kitchen'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#195c45]">
                      {formatMoney(f.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
