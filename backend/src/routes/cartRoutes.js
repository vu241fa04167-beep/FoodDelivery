import { Router } from 'express';
import * as cart from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, cart.getCart);
router.put('/', protect, cart.changeCart);
router.delete('/', protect, cart.clearCart);
router.post('/apply-coupon', protect, cart.applyCoupon);
router.post('/validate-coupon', protect, cart.applyCoupon);

export default router;
