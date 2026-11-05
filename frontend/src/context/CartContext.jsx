import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Cart Context for managing single-restaurant cart state
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load saved cart from localStorage on initial page load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setRestaurant(parsed.restaurant || null);
        }
      }
    } catch {
      localStorage.removeItem('cart');
    } finally {
      // Do not let the initial empty React state overwrite a saved cart
      // before it has finished loading from localStorage.
      setHydrated(true);
    }
  }, []);

  // Sync cart state with localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('cart', JSON.stringify({ restaurant, items }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [hydrated, restaurant, items]);

  // Derived values: total items count and subtotal
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Add an item to cart (warns if from another restaurant)
  const addItem = (item, currentRestaurant) => {
    if (restaurant && restaurant.id !== currentRestaurant._id && items.length > 0) {
      const ok = window.confirm('Your cart has items from another restaurant. Clear it and add this item?');
      if (!ok) return false;
      setRestaurant({ id: currentRestaurant._id, name: currentRestaurant.name });
      setItems([{ menuItemId: item._id, name: item.name, price: item.price, isVeg: item.isVeg, quantity: 1 }]);
      return true;
    }

    if (!restaurant) {
      setRestaurant({ id: currentRestaurant._id, name: currentRestaurant.name });
    }

    setItems((prev) => {
      const exist = prev.find((i) => i.menuItemId === item._id);
      if (exist) {
        return prev.map((i) => (i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, isVeg: item.isVeg, quantity: 1 }];
    });
    return true;
  };

  // Increase item quantity
  const increaseQty = (menuItemId) => {
    setItems((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i)));
  };

  // Decrease item quantity (removes item at 0)
  const decreaseQty = (menuItemId) => {
    setItems((prev) => {
      const updated = prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0);
      if (updated.length === 0) setRestaurant(null);
      return updated;
    });
  };

  // Remove an item directly
  const removeItem = (menuItemId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.menuItemId !== menuItemId);
      if (updated.length === 0) setRestaurant(null);
      return updated;
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
    localStorage.removeItem('cart');
  };

  // Reorder past items into cart
  const loadCart = (newRestaurant, newItems) => {
    if (restaurant && restaurant.id !== newRestaurant.id && items.length > 0) {
      const ok = window.confirm('Your cart has items from another restaurant. Clear it and load this order?');
      if (!ok) return false;
    }
    setRestaurant(newRestaurant);
    setItems(newItems);
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        restaurant,
        items,
        itemCount,
        itemTotal,
        addItem,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
