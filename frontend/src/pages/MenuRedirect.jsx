import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Restaurant from './Restaurant.jsx';

// The app has one restaurant, so /menu is a stable customer-facing shortcut
// that resolves the current restaurant instead of exposing an opaque database id.
export default function MenuRedirect() {
  const [restaurantId, setRestaurantId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/restaurants')
      .then(({ data }) => {
        const restaurant = data.find((item) => item.name === 'Meghana Foods') || data[0];
        if (active && restaurant?._id) setRestaurantId(restaurant._id);
        else if (active) setError('The menu is temporarily unavailable.');
      })
      .catch(() => active && setError('The menu is temporarily unavailable.'));
    return () => { active = false; };
  }, []);

  if (restaurantId) return <Restaurant restaurantId={restaurantId} />;

  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center text-sm text-gray-500">
      {error || 'Opening today\'s menu...'}
      {error && <button type="button" onClick={() => window.location.reload()} className="block mx-auto mt-4 px-4 py-2 bg-primary text-white rounded text-xs font-bold">Retry</button>}
    </main>
  );
}
