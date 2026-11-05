import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../utils/storage.js';
import { formatMoney, formatDate, formatTime } from '../utils/formatters.js';

export { getStoredAuth, setStoredAuth, clearStoredAuth, formatMoney, formatDate, formatTime };

const API_ROOT = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
  const authToken = token || getStoredAuth()?.token;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Domain-specific service wrappers
export const authService = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
  googleAuth: (idToken) => api('/auth/google', { method: 'POST', body: { idToken } }),
  getProfile: (token) => api('/auth/me', { token }),
  updateProfile: (body, token) => api('/auth/profile', { method: 'PATCH', body, token }),
  getFavorites: (token) => api('/auth/favorites', { token }),
  toggleFavorite: (restaurantId, token) => api('/auth/favorites', { method: 'POST', body: { restaurantId }, token })
};

export const catalogService = {
  getCategories: () => api('/categories'),
  getRestaurants: (params = '') => api(`/restaurants${params ? `?${params}` : ''}`),
  getRestaurant: (id) => api(`/restaurants/${id}`),
  getSuggestions: (q) => api(`/search/suggestions?q=${encodeURIComponent(q)}`)
};

export const cartService = {
  getCart: (token) => api('/cart', { token }),
  updateItem: (foodId, quantity, notes, token) => api('/cart', { method: 'PUT', body: { foodId, quantity, notes }, token }),
  clearCart: (token) => api('/cart', { method: 'DELETE', token }),
  validateCoupon: (code, subtotal, token) => api('/cart/validate-coupon', { method: 'POST', body: { code, subtotal }, token })
};

export const orderService = {
  checkout: (payload, token) => api('/orders/checkout', { method: 'POST', body: payload, token }),
  getOrders: (token) => api('/orders', { token }),
  getOrder: (id, token) => api(`/orders/${id}`, { token }),
  cancelOrder: (id, reason, token) => api(`/orders/${id}/cancel`, { method: 'PATCH', body: { reason }, token }),
  addReview: (payload, token) => api('/orders/review', { method: 'POST', body: payload, token })
};

export const groupService = {
  createGroup: (restaurantId, token) => api('/groups/create', { method: 'POST', body: { restaurantId }, token }),
  getGroup: (code, token) => api(`/groups/${code}`, { token }),
  joinGroup: (code, token) => api(`/groups/${code}/join`, { method: 'POST', token }),
  addItem: (code, payload, token) => api(`/groups/${code}/items`, { method: 'POST', body: payload, token }),
  removeItem: (code, itemId, token) => api(`/groups/${code}/items/${itemId}`, { method: 'DELETE', token }),
  checkout: (code, payload, token) => api(`/groups/${code}/checkout`, { method: 'POST', body: payload, token })
};

export const rescueService = {
  getListings: () => api('/rescue'),
  reserveListing: (id, quantity, token) => api(`/rescue/${id}/reserve`, { method: 'POST', body: { quantity }, token })
};

export const restaurantService = {
  getOverview: (token) => api('/restaurant/overview', { token }),
  getOrders: (token) => api('/restaurant/orders', { token }),
  updateOrderStatus: (id, status, token) => api(`/restaurant/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),
  createFood: (payload, token) => api('/restaurant/foods', { method: 'POST', body: payload, token }),
  updateFood: (id, payload, token) => api(`/restaurant/foods/${id}`, { method: 'PATCH', body: payload, token }),
  deleteFood: (id, token) => api(`/restaurant/foods/${id}`, { method: 'DELETE', token }),
  getRescueListings: (token) => api('/restaurant/rescue', { token }),
  createRescueListing: (payload, token) => api('/restaurant/rescue', { method: 'POST', body: payload, token })
};

export const adminService = {
  getStats: (token) => api('/admin/stats', { token }),
  getRestaurants: (token) => api('/admin/restaurants', { token }),
  approveRestaurant: (id, token) => api(`/admin/restaurants/${id}/approve`, { method: 'PATCH', token }),
  rejectRestaurant: (id, token) => api(`/admin/restaurants/${id}/reject`, { method: 'PATCH', token }),
  getUsers: (token) => api('/admin/users', { token }),
  createCategory: (payload, token) => api('/admin/categories', { method: 'POST', body: payload, token }),
  createCoupon: (payload, token) => api('/admin/coupons', { method: 'POST', body: payload, token })
};

export default api;
