import React from 'react';
import formatPrice from '../utils/formatPrice.js';
import { useCart } from '../context/CartContext.jsx';

export default function MenuItemCard({ item, restaurant }) {
  const { items, addItem, increaseQty, decreaseQty } = useCart();
  const fallbackImage = '/images/foods/fallback.jpg';

  // Check if this item is already in cart
  const cartItem = items.find((i) => i.menuItemId === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-100 rounded hover:border-gray-200 transition-colors">
      
      {/* Left Details */}
      <div className="flex-1 pr-2">
        {/* Veg / Non-Veg Indicator */}
        <div className="mb-1.5 flex items-center">
          {item.isVeg ? (
            <span className="w-4 h-4 border border-green-600 flex items-center justify-center p-0.5 rounded-xs" title="Pure Veg">
              <span className="w-2 h-2 bg-green-600 rounded-full" />
            </span>
          ) : (
            <span className="w-4 h-4 border border-red-600 flex items-center justify-center p-0.5 rounded-xs" title="Non-Veg">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
            </span>
          )}
        </div>

        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
        <div className="text-sm font-semibold text-gray-800 mt-0.5">
          {formatPrice(item.price)}
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Right Image & Add Button */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-28 h-24 rounded bg-gray-100 overflow-hidden">
          <img
            src={item.image || fallbackImage}
            alt={item.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quantity Controls / Add Button */}
        <div className="mt-[-16px] shadow-sm z-10">
          {!item.isAvailable ? (
            <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded font-semibold border border-gray-200 cursor-not-allowed">
              Not available
            </span>
          ) : quantity > 0 ? (
            <div className="flex items-center bg-white border border-gray-300 rounded font-bold text-sm shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => decreaseQty(item._id)}
                className="px-2.5 py-1 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
              >
                -
              </button>
              <span className="px-2 text-primary text-xs">{quantity}</span>
              <button
                type="button"
                onClick={() => increaseQty(item._id)}
                className="px-2.5 py-1 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(item, restaurant)}
              className="bg-white text-primary border border-gray-300 hover:border-primary px-5 py-1 rounded text-xs font-bold uppercase tracking-wider hover:bg-orange-50 transition-colors shadow-xs"
            >
              Add
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

