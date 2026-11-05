import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Location */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <span className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-lg">
              Q
            </span>
            <span>Quick<span className="text-primary">Bite</span></span>
          </Link>
          <span className="hidden sm:inline text-xs text-gray-500 font-medium border-l border-gray-200 pl-3">
            <b className="text-gray-900">Bengaluru,</b> Karnataka
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/menu" className="hover:text-primary">Menu</Link>
        </nav>

        {/* Right Menu */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/cart" className="flex items-center gap-1.5 text-gray-700 hover:text-primary px-2 py-1">
            <span>Cart</span>
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded font-bold">{itemCount}</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-800 hover:text-primary border border-gray-200 rounded text-sm"
              >
                <span>{user.name}</span>
                <span className="text-xs text-gray-400">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-md py-1 text-sm z-50">
                  <div className="px-3 py-1 text-xs text-gray-400 font-semibold border-b border-gray-100 uppercase">
                    Role: {user.role}
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary">
                    My Profile
                  </Link>
                  {user.role === 'customer' && (
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary">
                      My Orders
                    </Link>
                  )}
                  {user.role === 'owner' && (
                    <Link to="/owner" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Dashboard
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-gray-700 hover:text-primary px-2 py-1">Login</Link>
              <Link to="/signup" className="bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-hover font-medium">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
