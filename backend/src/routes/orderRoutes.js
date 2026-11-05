import { Router } from 'express';
import * as orders from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/checkout', protect, orders.checkout);
router.get('/', protect, orders.myOrders);
router.get('/my', protect, orders.myOrders);
router.get('/:id', protect, orders.getOrderById);
router.post('/:id/cancel', protect, orders.cancelOrder);
router.patch('/:id/cancel', protect, orders.cancelOrder);
router.post('/review', protect, orders.addReview);

export default router;
