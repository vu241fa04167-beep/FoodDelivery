import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import MenuItemCard from '../components/MenuItemCard.jsx';
import CartSidebar from '../components/CartSidebar.jsx';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function Restaurant() {
  const { id } = useParams();
  const { itemCount, itemTotal } = useCart();

  const [restaurant, setRestaurant] = useState(null), [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [dietFilter, setDietFilter] = useState('all'), [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        setError('');
        const [restRes, menuRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/menu`)
        ]);
        setRestaurant(restRes.data);
        setMenuItems(menuRes.data);
        if (menuRes.data.length > 0) setActiveCategory(menuRes.data[0].category);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Restaurant not found' : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAndMenu();
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-gray-500">Loading menu...</div>;

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">404 - Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">{error || 'Restaurant not found'}</p>
        <Link to="/" className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded">Back to Home</Link>
      </div>
    );
  }

  const dietaryItems = dietFilter === 'veg'
    ? menuItems.filter((i) => i.isVeg)
    : dietFilter === 'nonveg'
      ? menuItems.filter((i) => !i.isVeg)
      : menuItems;
  const filteredItems = [...dietaryItems].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
  });
  const categories = [...new Set(menuItems.map((i) => i.category))];
  const groupedItems = categories.reduce((acc, cat) => {
    const itemsInCat = filteredItems.filter((i) => i.category === cat);
    if (itemsInCat.length > 0) acc[cat] = itemsInCat;
    return acc;
  }, {});

  return (
    <div className="bg-[#fffaf5]/90 min-h-screen pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white/95 border-b border-orange-100 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{restaurant.cuisine} • {restaurant.area}</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="bg-green-700 text-white px-2 py-1 rounded">★ {restaurant.rating || 4.2}</span>
            <span className="text-gray-700">{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Category Strip */}
        <aside className="md:col-span-3 sticky top-20 bg-white border border-gray-200 rounded p-3 overflow-x-auto md:overflow-visible flex md:flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700 pb-2 md:border-b border-gray-100">
            <span className="block mb-1">Food preference</span>
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-medium bg-white">
              <option value="all">All items</option>
              <option value="veg">Veg only</option>
              <option value="nonveg">Non-veg only</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-700 pt-1">
            <span className="block mb-1">Sort items</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-medium bg-white">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-orange-50 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </a>
          ))}
        </aside>

        {/* Center Menu List */}
        <div className="md:col-span-6 space-y-6">
          {Object.entries(groupedItems).length === 0 ? (
            <div className="bg-white p-6 rounded border border-gray-200 text-center text-xs text-gray-500">
              No dishes found matching your food preference.
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <section key={category} id={`cat-${category}`} className="bg-white rounded border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3 pb-1 border-b border-gray-100">{category} ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} restaurant={restaurant} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Right Desktop Cart Sidebar */}
        <aside className="hidden md:block md:col-span-3 sticky top-20">
          <CartSidebar />
        </aside>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {itemCount > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-white p-3.5 flex items-center justify-between font-bold text-sm shadow-lg z-40">
          <div>{itemCount} {itemCount === 1 ? 'item' : 'items'} | {formatPrice(itemTotal)}</div>
          <Link to="/cart" className="bg-white text-primary px-3 py-1 rounded text-xs uppercase font-extrabold">View cart</Link>
        </div>
      )}
    </div>
  );
}
