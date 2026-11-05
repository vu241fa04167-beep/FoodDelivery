import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

// Create the Auth Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved user & token from localStorage on initial page load
  useEffect(() => {
    let active = true;
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Validate persisted credentials once so stale tokens never surface
        // as confusing order/checkout errors later in the journey.
        api.get('/auth/me')
          .then((res) => {
            if (!active) return;
            const currentUser = res.data?.user;
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
            }
          })
          .catch(() => {
            if (!active) return;
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          });
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      if (active) setLoading(false);
    }
    const onAuthLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', onAuthLogout);
    return () => {
      active = false;
      window.removeEventListener('auth:logout', onAuthLogout);
    };
  }, []);

  // Login function: sends credentials to backend, stores token & user
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    // Save state and localStorage
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  // Register function: creates a new customer account
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    // Save state and localStorage
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  // Update user in state and localStorage (e.g. after profile edit)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Logout function: clears state and localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

