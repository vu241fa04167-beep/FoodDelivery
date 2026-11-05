import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import RestaurantCard from '../../components/customer/RestaurantCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';

export default function FavoritesPage({
  auth,
  onOpenRestaurant,
  onNavigateHome,
  onFlash
}) {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await api('/auth/favorites');
      setFavoriteRestaurants(data);
    } catch (err) {
      console.error('Failed to load favorites', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (restaurantId) => {
    try {
      await api('/auth/favorites', {
        method: 'POST',
        body: { restaurantId }
      });
      fetchFavorites();
      onFlash('Favorites updated');
    } catch (err) {
      onFlash(err.message || 'Failed to update favorites');
    }
  };

  if (!auth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Sign in to view saved favorites"
          description="Keep your favorite pizzerias, sushi bars, and healthy kitchens in one quick-access list."
          actionText="Sign In"
          onAction={onNavigateHome}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 pb-28">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
          <Heart size={14} className="fill-red-500 text-red-500" />
          <span>Saved Wishlist</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211d]">
          Your Favorite Kitchens
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#66706b]">
          Quickly reorder and check daily availability from your top-rated spots.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#66706b]">
          Loading your favorites…
        </div>
      ) : favoriteRestaurants.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorite restaurants yet"
          description="Click the heart icon on any restaurant card to save your go-to kitchens here for quick ordering."
          actionText="Explore Restaurants"
          onAction={onNavigateHome}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {favoriteRestaurants.map((rest) => (
            <RestaurantCard
              key={rest._id}
              restaurant={rest}
              onOpen={onOpenRestaurant}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
