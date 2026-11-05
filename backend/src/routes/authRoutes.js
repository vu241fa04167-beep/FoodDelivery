import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as mgmt from '../controllers/managementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/google', auth.googleLogin);
router.post('/forgot-password', auth.forgotPassword);
router.get('/me', protect, auth.me);
router.post('/favorites', protect, auth.toggleFavorite);
router.get('/favorites', protect, auth.getFavorites);
router.patch('/profile', protect, mgmt.profile);
router.put('/profile', protect, mgmt.profile);

export default router;
