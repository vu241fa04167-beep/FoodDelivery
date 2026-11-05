export const validateRegisterInput = ({ name, email, password }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Full name is required';
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'A valid email address is required';
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'A password of at least 6 characters is required';
  }
  return null;
};

export const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return 'Email and password are required';
  }
  return null;
};

