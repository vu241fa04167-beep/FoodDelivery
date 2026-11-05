import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import CartDrawer from './components/customer/CartDrawer.jsx';
import LocationModal from './components/common/LocationModal.jsx';
import SearchModal from './components/common/SearchModal.jsx';
import AuthModal from './pages/auth/AuthModal.jsx';
import NotificationToast from './components/common/NotificationToast.jsx';

import HomePage from './pages/customer/HomePage.jsx';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage.jsx';
import CheckoutPage from './pages/customer/CheckoutPage.jsx';
import OrdersPage from './pages/customer/OrdersPage.jsx';
import FoodRescuePage from './pages/customer/FoodRescuePage.jsx';
import GroupOrderPage from './pages/customer/GroupOrderPage.jsx';
import FavoritesPage from './pages/customer/FavoritesPage.jsx';
import ProfilePage from './pages/customer/ProfilePage.jsx';
import RestaurantDashboardPage from './pages/restaurant/RestaurantDashboardPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';

import {
  api,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth
} from './services/api.js';

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [view, setView] = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('West Village, NY');
  const [favorites, setFavorites] = useState([]);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState('');
  const [initialGroupCode, setInitialGroupCode] = useState('');

  // Modals & Notifications
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [notification, setNotification] = useState(null);

  const token = auth?.token;

  const flash = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  // Check URL params for group code invitations e.g. /?group=SAV7X9
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gCode = params.get('group');
    if (gCode) {
      setInitialGroupCode(gCode.toUpperCase());
      setView('group');
    }
  }, []);

  // Load user cart
  const loadCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [] });
      return;
    }
    try {
      const data = await api('/cart', { token });
      setCart(data);
    } catch (err) {
      setCart({ items: [] });
    }
  }, [token]);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }
    try {
      const favs = await api('/auth/favorites', { token });
      setFavorites(favs.map((f) => (f._id ? f._id : f)));
    } catch (err) {
      setFavorites([]);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
    loadFavorites();
  }, [loadCart, loadFavorites]);

  // Cart item update handler
  const handleUpdateCart = async (food, quantity, notes) => {
    if (!token) {
      flash('Please sign in to add dishes to your cart');
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    try {
      const updated = await api('/cart', {
        method: 'PUT',
        token,
        body: {
          foodId: food._id,
          quantity,
          notes
        }
      });
      setCart(updated);
      flash(quantity > 0 ? `Updated ${food.name}` : `Removed ${food.name}`);
    } catch (err) {
      flash(err.message || 'Cart update failed', 'error');
    }
  };

  // Clear cart and add dish (when replacing restaurant conflict)
  const handleClearCartAndAdd = async (food, quantity, notes) => {
    try {
      await api('/cart', { method: 'DELETE', token });
      const updated = await api('/cart', {
        method: 'PUT',
        token,
        body: { foodId: food._id, quantity, notes }
      });
      setCart(updated);
      flash(`Cart started with ${food.name}`);
    } catch (err) {
      flash(err.message || 'Failed to replace cart', 'error');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!token) return setCart({ items: [] });
    try {
      await api('/cart', { method: 'DELETE', token });
      setCart({ items: [] });
      setAppliedCoupon(null);
      flash('Cart emptied');
    } catch (err) {
      flash(err.message || 'Could not clear cart', 'error');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (restaurantId) => {
    if (!token) {
      flash('Sign in to save restaurants to your favorites');
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    try {
      const res = await api('/auth/favorites', {
        method: 'POST',
        token,
        body: { restaurantId }
      });
      setFavorites(res.favorites.map(f => (f._id ? f._id : f)));
      flash(res.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (err) {
      flash(err.message || 'Could not update favorites', 'error');
    }
  };

  // Reorder past order
  const handleReorder = async (order) => {
    if (!token) return;
    try {
      await api('/cart', { method: 'DELETE', token });
      let updatedCart = { items: [] };
      for (const item of order.items) {
        if (item.food) {
          updatedCart = await api('/cart', {
            method: 'PUT',
            token,
            body: { foodId: item.food, quantity: item.quantity, notes: item.notes }
          });
        }
      }
      setCart(updatedCart);
      setIsCartOpen(true);
      flash('Dishes re-added to your cart!');
    } catch (err) {
      flash(err.message || 'Failed to reorder items', 'error');
    }
  };

  // Auth helpers
  const handleSignOut = () => {
    clearStoredAuth();
    setAuth(null);
    setCart({ items: [] });
    setFavorites([]);
    setView('home');
    flash('Signed out of Savor');
  };

  const handleAuthSuccess = (authData) => {
    setStoredAuth(authData);
    setAuth(authData);
    loadCart();
    loadFavorites();
  };

  const handleOpenRestaurant = (rest) => {
    setSelectedRestaurant(rest);
    setView('restaurant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGroupOrder = (rest) => {
    setSelectedRestaurant(rest);
    setView('group');
  };

  const cartCount = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7] text-[#17211d]">
      {/* Toast notifications */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Main Global Header */}
      <Header
        auth={auth}
        cartCount={cartCount}
        currentLocation={currentLocation}
        currentView={view}
        onNavigate={(newView) => {
          setView(newView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onSignOut={handleSignOut}
      />

      {/* Page Routing Views */}
      <div className="flex-1">
        {view === 'home' && (
          <HomePage
            onOpenRestaurant={handleOpenRestaurant}
            onOpenRescue={() => setView('rescue')}
            onOpenGroup={() => setView('group')}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenLocation={() => setIsLocationModalOpen(true)}
            currentLocation={currentLocation}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            selectedCuisineFilter={selectedCuisineFilter}
            onClearCuisineFilter={() => setSelectedCuisineFilter('')}
          />
        )}

        {view === 'restaurant' && (
          <RestaurantDetailPage
            restaurant={selectedRestaurant}
            onBack={() => setView('home')}
            cart={cart}
            onUpdateCart={handleUpdateCart}
            onClearCartAndAdd={handleClearCartAndAdd}
            onStartGroupOrder={handleStartGroupOrder}
            isFavorite={favorites.includes(selectedRestaurant?._id)}
            onToggleFavorite={handleToggleFavorite}
            onFlash={flash}
          />
        )}

        {view === 'checkout' && (
          <CheckoutPage
            auth={auth}
            cart={cart}
            onBack={() => setView('home')}
            onOrderSuccess={(order) => {
              loadCart();
              setView('orders');
            }}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={(coup) => {
              setAppliedCoupon(coup);
              flash(`Coupon ${coup.code} applied: -$${coup.discount}`);
            }}
            onRemoveCoupon={() => {
              setAppliedCoupon(null);
              flash('Coupon removed');
            }}
            onFlash={flash}
          />
        )}

        {view === 'orders' && (
          <OrdersPage
            auth={auth}
            onNavigateHome={() => setView('home')}
            onReorder={handleReorder}
            onFlash={flash}
          />
        )}

        {view === 'rescue' && (
          <FoodRescuePage
            auth={auth}
            onNavigateHome={() => setView('home')}
            onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            onFlash={flash}
          />
        )}

        {view === 'group' && (
          <GroupOrderPage
            auth={auth}
            onNavigateHome={() => setView('home')}
            onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
            onFlash={flash}
            initialGroupCode={initialGroupCode}
            onOrderSuccess={(order) => {
              loadCart();
              setView('orders');
            }}
          />
        )}

        {view === 'favorites' && (
          <FavoritesPage
            auth={auth}
            onOpenRestaurant={handleOpenRestaurant}
            onNavigateHome={() => setView('home')}
            onFlash={flash}
          />
        )}

        {view === 'profile' && (
          <ProfilePage
            auth={auth}
            setAuth={setAuth}
            onFlash={flash}
          />
        )}

        {view === 'restaurant-dashboard' && (
          <RestaurantDashboardPage
            auth={auth}
            onFlash={flash}
          />
        )}

        {view === 'admin' && (
          <AdminDashboardPage
            auth={auth}
            onFlash={flash}
          />
        )}
      </div>

      {/* Global Footer */}
      <Footer
        onNavigate={(newView) => {
          setView(newView);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCuisine={(c) => {
          setSelectedCuisineFilter(c);
          setView('home');
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          if (!token) {
            flash('Please sign in before checkout');
            setAuthModal({ isOpen: true, mode: 'login' });
            return;
          }
          setView('checkout');
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(coup) => {
          setAppliedCoupon(coup);
          flash(`Coupon ${coup.code} applied: -$${coup.discount}`);
        }}
        onRemoveCoupon={() => {
          setAppliedCoupon(null);
          flash('Coupon removed');
        }}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          flash(`Delivery location updated to ${loc}`);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectRestaurant={handleOpenRestaurant}
        onSelectCuisine={(c) => {
          setSelectedCuisineFilter(c);
          setView('home');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onSuccess={handleAuthSuccess}
        onFlash={flash}
      />
    </div>
  );
}
