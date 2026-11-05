import { Router } from 'express';
import * as groups from '../controllers/groupOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, groups.createGroup);
router.post('/create', protect, groups.createGroup);
router.post('/join', protect, groups.joinGroup);
router.post('/:code/join', protect, groups.joinGroup);
router.get('/:code', protect, groups.getGroup);
router.post('/:code/items', protect, groups.addGroupItem);
router.delete('/:code/items/:itemId', protect, groups.removeGroupItem);
router.post('/:code/checkout', protect, groups.checkoutGroup);

export default router;
