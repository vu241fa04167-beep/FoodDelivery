import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminStats,
  getAdminOrders,
  getAdminRestaurants,
  updateRestaurantApproval,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon
} from '../controllers/adminController.js';

const router = express.Router();

// Guard all admin routes: token required + admin role only
router.use(protect);
router.use(authorize('admin'));

// Platform Stats
router.get('/stats', getAdminStats);
router.get('/orders', getAdminOrders);

// Restaurant Approvals
router.get('/restaurants', getAdminRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantApproval);

// Coupon CRUD
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.put('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

export default router;

