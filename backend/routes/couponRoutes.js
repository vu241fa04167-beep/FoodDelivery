import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController.js';

const router = Router();

// Customer / Public coupon validation
router.post('/validate', validateCoupon);

export default router;

