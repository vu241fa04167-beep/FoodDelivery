import { Router } from 'express';
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Owner only routes
router.use(protect, authorize('owner'));

router.post('/', addMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/availability', toggleAvailability);

export default router;

