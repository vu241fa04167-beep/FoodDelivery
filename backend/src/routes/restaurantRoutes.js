import { Router } from 'express';
import * as mgmt from '../controllers/managementController.js';
import * as orders from '../controllers/orderController.js';
import * as rescue from '../controllers/rescueController.js';
import { protect, allow } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, allow('restaurant'));

router.get('/profile', mgmt.getRestaurantProfile);
router.put('/profile', mgmt.restaurantProfile);
router.get('/stats', mgmt.restaurantStats);

router.get('/foods', mgmt.restaurantFoods);
router.post('/foods', mgmt.restaurantFoods);
router.patch('/foods/:id', mgmt.restaurantFoods);
router.delete('/foods/:id', mgmt.deleteFood);

router.get('/orders', orders.restaurantOrders);
router.patch('/orders/:id', orders.updateStatus);

router.get('/rescue', rescue.restaurantRescueList);
router.post('/rescue', rescue.createRescue);
router.patch('/rescue/:id', rescue.updateRescueListing);

export default router;
