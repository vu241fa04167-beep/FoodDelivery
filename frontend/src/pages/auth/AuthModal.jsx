import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, User, Store, Shield, Lock, Mail } from 'lucide-react';
import { api, setStoredAuth } from '../../services/api.js';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onFlash
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'restaurant'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  // Google Identity Services initialisation
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (!isOpen || mode !== 'login' || !googleClientId) return;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setBusy(true);
          try {
            const data = await api('/auth/google', {
              method: 'POST',
              body: { credential }
            });
            setStoredAuth(data);
            onSuccess(data);
            onClose();
          } catch (err) {
            setError(err.message || 'Google sign-in failed');
          } finally {
            setBusy(false);
          }
        }
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'signin_with'
        });
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = setupGoogle;
      document.head.appendChild(script);
      return () => script.remove();
    }
  }, [isOpen, mode, googleClientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (mode === 'forgot') {
        const res = await api('/auth/forgot-password', {
          method: 'POST',
          body: { email }
        });
        onFlash(res.message);
        setMode('login');
        return;
      }

      if (mode === 'signup') {
        const data = await api('/auth/register', {
          method: 'POST',
          body: { name, email, password, role }
        });
        setStoredAuth(data);
        onSuccess(data);
        onFlash(`Welcome to Savor, ${data.user.name}!`);
        onClose();
        return;
      }

      // Login
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      setStoredAuth(data);
      onSuccess(data);
      onFlash(`Welcome back, ${data.user.name}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  // Quick Demo Fast-Login helper
  const handleDemoLogin = async (demoEmail, roleLabel) => {
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email: demoEmail, password: 'Password123!' }
      });
      setStoredAuth(data);
      onSuccess(data);
      onFlash(`Signed in as ${roleLabel} (${data.user.name})`);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-[#e7e9e6] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e7e9e6]">
          <div className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-[#17211d]">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ef6b42] text-sm text-white shadow-2xs">S</span>
            <span>savor</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#f7f6f1] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#ef6b42]">
            {mode === 'login' ? 'WELCOME BACK' : mode === 'signup' ? 'NEW DINER & PARTNER' : 'ACCOUNT ASSIST'}
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#17211d] mt-0.5">
            {mode === 'login' ? 'Sign in to Savor' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </h2>
        </div>

        {/* Quick Demo Logins Box */}
        {mode === 'login' && (
          <div className="mt-4 rounded-xl bg-[#f7f6f1] p-3 border border-[#e7e9e6]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17211d] mb-2">
              <Sparkles size={14} className="text-[#ef6b42]" />
              <span>Instant Test Accounts (1-Click)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@savor.local', 'Customer')}
                className="flex flex-col items-center justify-center rounded-lg bg-white p-2 text-center text-xs font-medium text-[#17211d] border border-[#e7e9e6] hover:border-[#195c45] hover:bg-[#e6efe8] transition"
              >
                <User size={14} className="text-[#195c45] mb-1" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('owner@savor.local', 'Kitchen Owner')}
                className="flex flex-col items-center justify-center rounded-lg bg-white p-2 text-center text-xs font-medium text-[#17211d] border border-[#e7e9e6] hover:border-[#ef6b42] hover:bg-[#fdf1ec] transition"
              >
                <Store size={14} className="text-[#ef6b42] mb-1" />
                <span>Restaurant</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@savor.local', 'Admin')}
                className="flex flex-col items-center justify-center rounded-lg bg-white p-2 text-center text-xs font-medium text-[#17211d] border border-[#e7e9e6] hover:border-[#195c45] hover:bg-[#e6efe8] transition"
              >
                <Shield size={14} className="text-[#195c45] mb-1" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 leading-snug">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Lane"
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-sm text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17211d] mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@savor.local"
              className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-sm text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#17211d]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-[#195c45] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-2.5 text-sm text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#17211d] mb-1">I am signing up as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`rounded-xl border p-2 text-xs font-semibold transition ${
                    role === 'customer'
                      ? 'border-[#195c45] bg-[#e6efe8] text-[#195c45]'
                      : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('restaurant')}
                  className={`rounded-xl border p-2 text-xs font-semibold transition ${
                    role === 'restaurant'
                      ? 'border-[#ef6b42] bg-[#fdf1ec] text-[#ef6b42]'
                      : 'border-[#e7e9e6] text-[#66706b] hover:bg-[#f7f6f1]'
                  }`}
                >
                  Restaurant Owner
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#195c45] py-2.5 text-sm font-semibold text-white hover:bg-[#124534] transition disabled:opacity-60 shadow-2xs mt-2"
          >
            {busy
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign in to Savor'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Google OAuth Section */}
        {mode === 'login' && (
          <div className="mt-3.5">
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#e7e9e6] w-full" />
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-[#66706b]">or</span>
            </div>

            {googleClientId ? (
              <div ref={googleBtnRef} className="flex justify-center" />
            ) : (
              <div className="rounded-xl border border-dashed border-[#e7e9e6] bg-[#fbfaf7] p-2 text-center text-[11px] text-[#66706b]">
                Google OAuth configured for production via GOOGLE_CLIENT_ID
              </div>
            )}
          </div>
        )}

        {/* Footer mode toggles */}
        <div className="mt-4 text-center text-xs text-[#66706b] border-t border-[#e7e9e6] pt-3">
          {mode === 'login' ? (
            <p>
              New to Savor?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#195c45] hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#195c45] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
