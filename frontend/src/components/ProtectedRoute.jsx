import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Component to protect routes based on login status and user role
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a simple loading indicator while checking localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to Login page with redirect query
  if (!user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // If role is restricted and user's role is not included, redirect to Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render child component
  return children;
}

