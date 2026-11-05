import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Search,
  UserRound,
  Store,
  LayoutDashboard,
  LogOut,
  Heart,
  Users,
  Menu,
  X,
  Sparkles,
  Percent
} from 'lucide-react';

export default function Header({
  auth,
  cartCount = 0,
  currentLocation = 'West Village, NY',
  currentView,
  onNavigate,
  onOpenCart,
  onOpenLocationModal,
  onOpenSearchModal,
  onOpenAuth,
  onSignOut
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = auth?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e9e6] bg-white/95 px-4 md:px-8 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-[#17211d] hover:opacity-90 transition"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ef6b42] text-base font-bold text-white shadow-2xs">
              S
            </span>
            <span className="tracking-tight">savor</span>
          </button>

          {/* Delivery Location Pill */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#f7f6f1] px-3.5 py-1.5 text-xs font-semibold text-[#17211d] hover:bg-[#eceae2] transition border border-[#e7e9e6]"
          >
            <MapPin size={14} className="text-[#ef6b42]" />
            <span className="truncate max-w-[150px]">{currentLocation}</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#66706b]">
          <button
            onClick={() => onNavigate('home')}
            className={`transition hover:text-[#17211d] ${
              currentView === 'home' ? 'font-bold text-[#195c45]' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => onNavigate('rescue')}
            className={`flex items-center gap-1.5 transition hover:text-[#17211d] ${
              currentView === 'rescue' ? 'font-bold text-[#ef6b42]' : ''
            }`}
          >
            <span className="rounded-full bg-[#fdf1ec] px-1.5 py-0.5 text-[10px] font-bold text-[#ef6b42]">
              Surplus
            </span>
            <span>Food Rescue</span>
          </button>
          <button
            onClick={() => onNavigate('group')}
            className={`flex items-center gap-1.5 transition hover:text-[#17211d] ${
              currentView === 'group' ? 'font-bold text-[#195c45]' : ''
            }`}
          >
            <Users size={15} />
            <span>Group Order</span>
          </button>
          {auth && (
            <button
              onClick={() => onNavigate('orders')}
              className={`transition hover:text-[#17211d] ${
                currentView === 'orders' ? 'font-bold text-[#195c45]' : ''
              }`}
            >
              My Orders
            </button>
          )}
          {auth && (
            <button
              onClick={() => onNavigate('favorites')}
              className={`flex items-center gap-1 transition hover:text-[#17211d] ${
                currentView === 'favorites' ? 'font-bold text-red-600' : ''
              }`}
            >
              <Heart size={14} />
              <span>Favorites</span>
            </button>
          )}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearchModal}
            aria-label="Search food and kitchens"
            className="flex items-center gap-2 rounded-xl border border-[#e7e9e6] bg-[#f7f6f1] px-3 py-2 text-xs font-medium text-[#66706b] hover:border-[#195c45]/40 hover:text-[#17211d] transition"
          >
            <Search size={15} />
            <span className="hidden md:inline">Search dishes…</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Open cart"
            className="relative rounded-xl border border-[#e7e9e6] bg-white p-2.5 text-[#17211d] hover:border-[#195c45]/40 hover:bg-[#f7f6f1] transition shadow-2xs"
          >
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#ef6b42] text-[10px] font-bold text-white shadow-2xs animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-[#e7e9e6] p-1 pr-2.5 hover:bg-[#f7f6f1] transition"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#e6efe8] text-xs font-bold text-[#195c45]">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-xs font-bold text-[#17211d] max-w-[90px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[#e7e9e6] bg-white p-2 shadow-lg animate-fade-in divide-y divide-[#e7e9e6]">
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-bold text-[#17211d] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#66706b] truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-[#e6efe8] px-2 py-0.5 text-[10px] font-bold text-[#195c45] capitalize">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('profile');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
                      >
                        <UserRound size={15} />
                        <span>Profile & Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('orders');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1] transition"
                      >
                        <ShoppingBag size={15} />
                        <span>My Deliveries</span>
                      </button>

                      {user.role === 'restaurant' && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('restaurant-dashboard');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#ef6b42] hover:bg-[#fdf1ec] transition"
                        >
                          <Store size={15} />
                          <span>Restaurant Portal</span>
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('admin');
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#195c45] hover:bg-[#e6efe8] transition"
                        >
                          <LayoutDashboard size={15} />
                          <span>Admin Control Panel</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={15} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="rounded-xl bg-[#195c45] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#124534] transition shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e7e9e6] bg-white py-4 px-2 space-y-1 animate-fade-in">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLocationModal();
            }}
            className="flex w-full items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
          >
            <MapPin size={16} className="text-[#ef6b42]" />
            <span>Delivery: {currentLocation}</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('home');
            }}
            className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
          >
            <span>Discover Kitchens</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('rescue');
            }}
            className="flex w-full items-center justify-between rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
          >
            <span>Food Rescue</span>
            <span className="rounded-full bg-[#fdf1ec] px-2 py-0.5 text-[10px] font-bold text-[#ef6b42]">
              Surplus Meals
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('group');
            }}
            className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
          >
            <Users size={16} />
            <span>Smart Group Order</span>
          </button>

          {auth && (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('orders');
                }}
                className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
              >
                <span>My Orders</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('favorites');
                }}
                className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
              >
                <Heart size={16} />
                <span>Saved Favorites</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('profile');
                }}
                className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#17211d] hover:bg-[#f7f6f1]"
              >
                <span>Account Profile</span>
              </button>

              {user?.role === 'restaurant' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('restaurant-dashboard');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#ef6b42] bg-[#fdf1ec]/60"
                >
                  <Store size={16} />
                  <span>Restaurant Dashboard</span>
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-2.5 text-sm font-semibold text-[#195c45] bg-[#e6efe8]/60"
                >
                  <LayoutDashboard size={16} />
                  <span>Admin Control Panel</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
