import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurant,
  createRestaurant,
  updateRestaurant
} from '../controllers/restaurantController.js';
import { getMenuByRestaurant } from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/mine', protect, authorize('owner'), getMyRestaurant);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getMenuByRestaurant);

// Owner protected routes
router.post('/', protect, authorize('owner'), createRestaurant);
router.put('/:id', protect, authorize('owner'), updateRestaurant);

export default router;

