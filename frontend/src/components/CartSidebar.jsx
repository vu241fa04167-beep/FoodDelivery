import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import formatPrice from '../utils/formatPrice.js';

export default function CartSidebar() {
  const { restaurant, items, itemCount, itemTotal, increaseQty, decreaseQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-6 text-center shadow-xs">
        <h3 className="font-bold text-gray-800 text-base mb-1">Cart Empty</h3>
        <p className="text-xs text-gray-500 mb-4">
          Good food is always cooking! Add items from the menu to start your order.
        </p>
        <div className="w-16 h-1 bg-gray-100 mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
      <div className="border-b border-gray-100 pb-3 mb-3">
        <h3 className="font-bold text-gray-900 text-sm">{restaurant?.name || 'Your Order'}</h3>
        <p className="text-xs text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              <span className="truncate text-gray-800 font-medium">{item.name}</span>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center border border-gray-200 rounded shrink-0 font-semibold">
              <button
                type="button"
                onClick={() => decreaseQty(item.menuItemId)}
                className="px-2 py-0.5 text-gray-600 hover:text-primary hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-1.5 text-primary text-xs">{item.quantity}</span>
              <button
                type="button"
                onClick={() => increaseQty(item.menuItemId)}
                className="px-2 py-0.5 text-gray-600 hover:text-primary hover:bg-gray-50"
              >
                +
              </button>
            </div>

            <div className="font-semibold text-gray-900 w-14 text-right shrink-0">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal Bill */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-gray-900 mb-4">
        <span>Subtotal</span>
        <span>{formatPrice(itemTotal)}</span>
      </div>

      {/* Checkout Button */}
      <Link
        to="/cart"
        className="block w-full py-2.5 px-4 bg-primary text-white text-center text-sm font-semibold rounded hover:bg-primary-hover transition-colors shadow-xs"
      >
        Checkout ({formatPrice(itemTotal)})
      </Link>
    </div>
  );
}

