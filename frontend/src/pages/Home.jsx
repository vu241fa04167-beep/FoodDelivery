import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import formatPrice from '../utils/formatPrice.js';

const fallbackImage = '/images/foods/fallback.jpg';
const categories = [
  ['Biryani Specials', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80'],
  ['Starters', 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=500&q=80'],
  ['Kebabs and Tandoori', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80'],
  ['Curries and Gravies', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=500&q=80'],
  ['Rice and Fried Rice', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'],
  ['Indian Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80'],
  ['Beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'],
  ['Desserts', 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?auto=format&fit=crop&w=500&q=80']
];

const useFallback = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

export default function Home() {
  const [restaurant, setRestaurant] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/restaurants')
      .then(({ data }) => {
        const current = data.find((item) => item.name === 'Meghana Foods') || data[0];
        if (!current) throw new Error('No restaurant');
        return api.get(`/restaurants/${current._id}/menu`).then(({ data: menu }) => ({ current, menu }));
      })
      .then(({ current, menu }) => {
        if (!active) return;
        setRestaurant(current);
        const preferred = ['Chicken Dum Biryani', 'Veg Biryani', 'Chicken 65', 'Paneer Tikka'];
        setFeatured(preferred.map((name) => menu.find((item) => item.name === name)).filter(Boolean));
      })
      .catch(() => active && setError('The menu is temporarily unavailable.'));
    return () => { active = false; };
  }, []);

  if (!restaurant && !error) return <main className="max-w-6xl mx-auto px-4 py-24 text-center text-sm text-gray-500">Preparing today&apos;s menu...</main>;
  if (error) return <main className="max-w-md mx-auto px-4 py-24 text-center"><p className="text-red-600 font-semibold mb-3">{error}</p><button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded text-sm font-semibold">Retry</button></main>;

  return (
    <main className="bg-[#fffaf5] flex-1">
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-12 md:pt-14 md:pb-16 grid md:grid-cols-2 gap-8 items-center">
        <div><span className="inline-flex bg-orange-100 text-orange-800 rounded-full px-3 py-1 text-xs font-bold">MEGHANA FOODS · KORAMANGALA</span><h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight text-gray-950 leading-[1.05]">Biryani worth<br /><span className="text-primary">coming back for.</span></h1><p className="mt-5 text-base text-gray-600 max-w-md leading-relaxed">Slow-cooked rice, bold Andhra flavours and comfort food made fresh for your table.</p><div className="mt-7 flex flex-wrap gap-3"><Link to={`/restaurant/${restaurant._id}`} className="px-5 py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover">Browse the menu →</Link><Link to="/cart" className="px-5 py-3 rounded-lg bg-white text-gray-800 text-sm font-bold border border-gray-200">View your cart</Link></div><div className="mt-8 flex items-center gap-5 text-xs text-gray-500"><span><b className="text-gray-900">{restaurant.rating || 4.4}</b> ★ rating</span><span>{restaurant.deliveryTime || '25–35 mins'} delivery</span><span>{formatPrice(restaurant.minOrder || 150)} minimum</span></div></div>
        <div className="relative rounded-3xl overflow-hidden h-72 md:h-96 shadow-xl bg-gray-200"><img src={restaurant.image || fallbackImage} onError={useFallback} alt="Meghana Foods biryani" className="w-full h-full object-cover" /><div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-xl p-3 flex items-center justify-between"><span className="text-xs font-bold text-gray-900">Freshly prepared today</span><span className="text-xs text-primary font-bold">Open now</span></div></div>
      </section>
      <section className="max-w-6xl mx-auto px-4 pb-10"><div className="flex items-end justify-between mb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Explore</p><h2 className="text-2xl font-black text-gray-950">What are you craving?</h2></div><Link to={`/restaurant/${restaurant._id}`} className="text-sm font-bold text-primary">See full menu →</Link></div><div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">{categories.map(([name, image]) => <Link key={name} to={`/restaurant/${restaurant._id}#cat-${name}`} className="relative overflow-hidden rounded-2xl min-h-24 flex items-end"><img src={image} onError={useFallback} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-60" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="relative p-3 text-[11px] leading-tight font-bold text-white">{name}</span></Link>)}</div></section>
      <section className="max-w-6xl mx-auto px-4 pb-16"><div className="flex items-end justify-between mb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Popular today</p><h2 className="text-2xl font-black text-gray-950">Customer favourites</h2></div><Link to={`/restaurant/${restaurant._id}`} className="text-sm font-bold text-primary">View all items →</Link></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{featured.map((item) => <Link key={item._id} to={`/restaurant/${restaurant._id}#cat-${item.category}`} className="bg-white rounded-2xl overflow-hidden border border-orange-100 hover:shadow-md transition-shadow"><img src={item.image || fallbackImage} onError={useFallback} alt={item.name} loading="lazy" className="w-full h-32 object-cover" /><div className="p-3"><h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3><p className="mt-1 text-sm font-black text-primary">{formatPrice(item.price)}</p><p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{item.description}</p></div></Link>)}</div></section>
    </main>
  );
}
