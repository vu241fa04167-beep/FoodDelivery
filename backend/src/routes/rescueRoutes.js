import { Router } from 'express';
import * as rescue from '../controllers/rescueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', rescue.listRescue);
router.post('/:id/purchase', protect, rescue.buyRescue);
router.post('/:id/reserve', protect, rescue.buyRescue);

export default router;
