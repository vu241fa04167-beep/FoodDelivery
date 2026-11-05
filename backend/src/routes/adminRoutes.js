import { Router } from 'express';
import * as mgmt from '../controllers/managementController.js';
import { protect, allow } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, allow('admin'));

router.get('/dashboard', mgmt.dashboard);
router.get('/coupons', mgmt.manageCoupons);
router.post('/coupons', mgmt.manageCoupons);
router.patch('/coupons/:id', mgmt.manageCoupons);
router.delete('/coupons/:id', mgmt.manageCoupons);

router.get('/:type', mgmt.adminList);
router.patch('/restaurants/:id', mgmt.approve);
router.patch('/orders/:id', mgmt.adminUpdateOrder);

router.post('/categories', mgmt.manageCategories);
router.patch('/categories/:id', mgmt.manageCategories);
router.delete('/categories/:id', mgmt.manageCategories);

export default router;
