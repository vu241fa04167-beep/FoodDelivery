import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User, Restaurant } from '../models/index.js';
import { buildAuthPayload } from '../utils/tokenHelper.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';

export const register = async (req, res, next) => {
  try {
    const error = validateRegisterInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const { name, email, password, role = 'customer' } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();

    if (await User.findOne({ email: cleanEmail })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const userRole = ['customer', 'restaurant'].includes(role) ? role : 'customer';
    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: await bcrypt.hash(password, 12),
      role: userRole
    });

    if (userRole === 'restaurant') {
      await Restaurant.create({
        owner: user._id,
        name: `${user.name}'s Kitchen`,
        description: 'New artisanal kitchen preparing delicious dishes.',
        cuisines: ['Contemporary'],
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85',
        coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
        address: 'Downtown Food District',
        city: 'New York',
        deliveryTime: '25-35 min',
        deliveryFee: 2.5,
        rating: 4.8,
        approved: false
      });
    }

    res.status(201).json(buildAuthPayload(user));
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const error = validateLoginInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const { email, password } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    res.json(buildAuthPayload(user));
  } catch (e) {
    next(e);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    let email, name, sub;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (clientId && clientId !== 'your_google_web_client_id.apps.googleusercontent.com') {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      const g = ticket.getPayload();
      if (!g?.email || !g.email_verified) {
        return res.status(401).json({ message: 'Google email is not verified' });
      }
      email = g.email;
      name = g.name || g.email.split('@')[0];
      sub = g.sub;
    } else {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          email = decoded.email;
          name = decoded.name || email?.split('@')[0];
          sub = decoded.sub;
        }
      } catch (err) {}

      if (!email) {
        return res.status(400).json({
          message: 'To use Google sign-in in production, configure GOOGLE_CLIENT_ID'
        });
      }
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        googleId: sub,
        role: 'customer'
      });
    }

    res.json(buildAuthPayload(user));
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Please provide an email address' });
  res.json({
    message: 'If an account exists with this email, password reset instructions have been prepared.'
  });
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) return res.status(400).json({ message: 'Restaurant ID required' });

    const user = await User.findById(req.user._id);
    const index = user.favorites.findIndex(id => id.toString() === restaurantId);
    let isFavorite;

    if (index > -1) {
      user.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      user.favorites.push(restaurantId);
      isFavorite = true;
    }

    await user.save();
    res.json({ isFavorite, favorites: user.favorites });
  } catch (e) {
    next(e);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites || []);
  } catch (e) {
    next(e);
  }
};
