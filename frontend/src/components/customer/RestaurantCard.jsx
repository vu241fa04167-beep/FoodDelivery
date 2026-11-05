import React from 'react';
import { Star, Clock3, Heart, Sparkles } from 'lucide-react';
import { formatMoney } from '../../services/api.js';

export default function RestaurantCard({
  restaurant,
  onOpen,
  isFavorite = false,
  onToggleFavorite
}) {
  const {
    name,
    cuisines = [],
    image,
    rating = 4.8,
    numReviews = 0,
    deliveryTime = '25-35 min',
    deliveryFee = 2.5,
    priceRange = '$$'
  } = restaurant;

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(restaurant._id);
  };

  return (
    <div
      onClick={() => onOpen(restaurant)}
      className="group flex flex-col rounded-2xl bg-white border border-[#e7e9e6] p-3 shadow-xs hover:shadow-md hover:border-[#195c45]/30 transition-all duration-200 cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#f7f6f1]">
        <img
          src={image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80'}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
        />

        {/* Favorite Button */}
        <button
          onClick={handleHeartClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition shadow-xs ${
            isFavorite
              ? 'bg-red-50 text-red-500'
              : 'bg-white/90 text-[#66706b] hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-[#17211d] shadow-xs backdrop-blur-xs">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span>{rating.toFixed(1)}</span>
          {numReviews > 0 && <span className="text-[#66706b] font-normal">({numReviews})</span>}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-[17px] font-bold text-[#17211d] group-hover:text-[#195c45] transition truncate">
              {name}
            </h3>
            <span className="text-xs font-semibold text-[#66706b]">{priceRange}</span>
          </div>

          <p className="mt-1 text-xs text-[#66706b] line-clamp-1">
            {cuisines.join(' · ')}
          </p>
        </div>

        {/* Delivery info footer */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#e7e9e6] pt-2.5 text-xs text-[#66706b]">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock3 size={13} className="text-[#195c45]" />
            <span>{deliveryTime}</span>
          </div>
          <div className="font-semibold text-[#17211d]">
            {deliveryFee === 0 ? (
              <span className="text-[#195c45] font-bold">Free Delivery</span>
            ) : (
              `Delivery ${formatMoney(deliveryFee)}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
