export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('savor_auth');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const setStoredAuth = (data) => {
  try {
    localStorage.setItem('savor_auth', JSON.stringify(data));
  } catch (err) {}
};

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem('savor_auth');
  } catch (err) {}
};

