import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper to pick safe public user fields
const sanitizeUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  address: u.address,
  addresses: u.addresses || []
});

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name.trim() || !email.trim()) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || name.trim().length > 80) {
      return res.status(400).json({ message: 'Enter a valid name and email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      // Public registration may create customers only. Owner/admin accounts are provisioned separately.
      role: 'customer',
      phone: phone || '',
      address: address || '',
      addresses: []
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ message: 'Registration successful', token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Login existing user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

// Get current logged-in user profile with addresses (no password hash)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update profile details (name, phone)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const trimmedPhone = phone !== undefined ? String(phone).trim() : '';
    if (trimmedPhone && !/^\d{10}$/.test(trimmedPhone)) {
      return res.status(400).json({ message: 'Phone must be a valid 10-digit number' });
    }

    const user = await User.findById(req.user._id).select('-password');
    user.name = name.trim();
    if (phone !== undefined) user.phone = trimmedPhone;
    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// Change password for logged-in user
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
