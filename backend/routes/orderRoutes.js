import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import {
  getOwnerOrders,
  updateOrderStatus,
  reviewOrder
} from '../controllers/orderReviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All order routes require authentication
router.use(protect);

// Customer specific routes
router.post('/', authorize('customer'), createOrder);
router.get('/mine', authorize('customer'), getMyOrders);
router.patch('/:id/cancel', authorize('customer'), cancelOrder);
router.post('/:id/review', authorize('customer'), reviewOrder);

// Owner & Admin order management
router.get('/restaurant', authorize('owner'), getOwnerOrders);
router.patch('/:id/status', authorize('owner', 'admin'), updateOrderStatus);

// Accessible by customer, owner or admin
router.get('/:id', getOrderById);

export default router;

