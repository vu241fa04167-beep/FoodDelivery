import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import RestaurantCard from '../components/RestaurantCard.jsx';

const CUISINES = ['All', 'North Indian', 'South Indian', 'Biryani', 'Pizza', 'Burgers', 'Chinese', 'Desserts'];

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [sortOption, setSortOption] = useState('rating');

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCuisine && selectedCuisine !== 'All') params.cuisine = selectedCuisine;
      if (isPureVeg) params.veg = 'true';
      if (sortOption) params.sort = sortOption;

      const res = await api.get('/restaurants', { params });
      setRestaurants(res.data);
    } catch (err) {
      console.error('Home page load error:', err);
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [search, selectedCuisine, isPureVeg, sortOption]);

  const handleCuisineClick = (cuisine) => {
    setSelectedCuisine(selectedCuisine === cuisine ? 'All' : cuisine);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Short Banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3.5 mb-6 text-center text-sm font-medium text-gray-700">
        Order authentic meals and fresh delicacies from top-rated restaurants across Bengaluru.
      </div>

      {/* Cuisine Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CUISINES.map((cuisine) => (
          <button
            key={cuisine}
            type="button"
            onClick={() => handleCuisineClick(cuisine)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCuisine === cuisine
                ? 'bg-primary text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-6 text-sm">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 text-xs">
          <input
            type="checkbox"
            checked={isPureVeg}
            onChange={(e) => setIsPureVeg(e.target.checked)}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
          <span>Pure Veg</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-primary text-gray-700 font-medium cursor-pointer"
          >
            <option value="rating">Rating (High to Low)</option>
            <option value="deliveryTime">Delivery Time</option>
            <option value="priceLow">Price (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton / Text */}
      {loading && (
        <div className="py-20 text-center text-gray-400 text-xs">
          Loading restaurants...
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div className="py-16 text-center">
          <p className="text-red-500 font-medium text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchRestaurants}
            className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && restaurants.length === 0 && (
        <div className="py-20 text-center text-gray-500 text-sm border border-dashed rounded-lg bg-gray-50">
          No restaurants found matching your criteria.
        </div>
      )}

      {/* Restaurant Cards Grid */}
      {!loading && !error && restaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </main>
  );
}
