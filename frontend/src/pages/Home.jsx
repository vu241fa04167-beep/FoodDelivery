import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import MenuItemCard from '../components/MenuItemCard.jsx';
import formatPrice from '../utils/formatPrice.js';

const CATEGORIES = ['All', 'Biryani Specials', 'Starters', 'Kebabs and Tandoori', 'Curries and Gravies', 'Rice and Fried Rice', 'Indian Breads', 'Beverages', 'Desserts'];

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [diet, setDiet] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/restaurants')
      .then(async ({ data }) => {
        const currentRestaurant = data.find((item) => item.name === 'Meghana Foods') || data[0];
        if (!currentRestaurant?._id) throw new Error('Menu unavailable');
        const menu = await api.get(`/restaurants/${currentRestaurant._id}/menu`);
        if (!active) return;
        setRestaurant(currentRestaurant);
        setMenuItems(menu.data);
      })
      .catch(() => active && setError("We could not load today's menu. Please retry."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = menuItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesDiet = diet === 'all' || (diet === 'veg' ? item.isVeg : !item.isVeg);
      const matchesSearch = !term || `${item.name} ${item.description || ''}`.toLowerCase().includes(term);
      return matchesCategory && matchesDiet && matchesSearch;
    });
    if (sort === 'recommended') {
      const rank = new Map(CATEGORIES.map((name, index) => [name, index]));
      return [...items].sort((a, b) => (rank.get(a.category) ?? 99) - (rank.get(b.category) ?? 99));
    }
    return [...items].sort((a, b) => sort === 'price-low' ? a.price - b.price : b.price - a.price);
  }, [menuItems, category, diet, sort, search]);

  if (loading) return <main className="page-state">Loading QuickBite menu…</main>;
  if (error || !restaurant) return <main className="page-state"><p>{error || 'Menu unavailable.'}</p><button className="primary-button" onClick={() => window.location.reload()}>Retry</button></main>;

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">QUICKBITE · BENGALURU</span>
          <h1>Real biryani.<br /><span>Made for your table.</span></h1>
          <p>Fresh Andhra flavours, comforting classics, and quick delivery from one trusted kitchen.</p>
          <div className="hero-actions"><Link to="/menu" className="primary-button">Browse full menu</Link><span className="hero-meta">★ {restaurant.rating || '4.4'} · {restaurant.deliveryTime || '25–35 mins'}</span></div>
        </div>
        <img className="home-hero-image" src={restaurant.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&q=85'} alt="Meghana Foods biryani" />
      </section>

      <section className="home-section">
        <div className="section-heading"><div><span className="eyebrow">THE COMPLETE MENU</span><h2>Order what feels right</h2></div><Link to="/menu" className="text-link">See all items →</Link></div>
        <div className="menu-controls"><select value={diet} onChange={(e) => setDiet(e.target.value)} aria-label="Food preference"><option value="all">All items</option><option value="veg">Veg only</option><option value="nonveg">Non-veg only</option></select><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort menu"><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
        <div className="category-chips">{CATEGORIES.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="menu-grid">{visibleItems.slice(0, 12).map((item) => <MenuItemCard key={item._id} item={item} restaurant={restaurant} compact />)}</div>
        <div className="center-action"><Link to="/menu" className="primary-button">View all {menuItems.length} items</Link></div>
      </section>
      <section className="home-trust"><span>✓ Accurate item photos</span><span>✓ Freshly prepared</span><span>✓ Live order updates</span><strong>{formatPrice(restaurant.minOrder || 150)} minimum order</strong></section>
    </main>
  );
}
