import React from 'react';
import { Link } from 'react-router-dom';
import formatPrice from '../utils/formatPrice.js';

export default function RestaurantCard({ restaurant }) {
  const fallbackImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="group block bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Restaurant Image */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <img
          src={restaurant.image || fallbackImage}
          alt={restaurant.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Delivery Time Pill */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2 py-0.5 rounded shadow-xs text-gray-800">
          {restaurant.deliveryTime}
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          <span className="flex items-center text-xs font-bold bg-green-700 text-white px-1.5 py-0.5 rounded shrink-0">
            ★ {restaurant.rating || 4.2}
          </span>
        </div>

        <p className="text-xs text-gray-500 truncate mb-2">
          {restaurant.cuisine}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 font-medium">
          <span>{restaurant.area}</span>
          <span>{formatPrice(restaurant.priceForTwo || 300)} for two</span>
        </div>
      </div>
    </Link>
  );
}

