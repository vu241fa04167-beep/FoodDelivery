import { Router } from 'express';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import groupRoutes from './groupRoutes.js';
import rescueRoutes from './rescueRoutes.js';
import restaurantRoutes from './restaurantRoutes.js';
import adminRoutes from './adminRoutes.js';
import * as auth from '../controllers/authController.js';
import * as mgmt from '../controllers/managementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Authentication & Users
router.use('/auth', authRoutes);

// Profile compatibility route
router.get('/profile', protect, auth.me);
router.patch('/profile', protect, mgmt.profile);
router.put('/profile', protect, mgmt.profile);

// Discovery & Catalog
router.use('/', catalogRoutes);

// Cart
router.use('/cart', cartRoutes);

// Orders
router.use('/orders', orderRoutes);

// Smart Group Ordering
router.use('/groups', groupRoutes);

// Food Rescue Surplus
router.use('/rescue', rescueRoutes);

// Restaurant Partner Dashboard
router.use('/restaurant', restaurantRoutes);

// Platform Administration
router.use('/admin', adminRoutes);

export default router;
