import { Router } from 'express';
import * as catalog from '../controllers/catalogController.js';

const router = Router();

router.get('/categories', catalog.categories);
router.get('/restaurants/suggestions', catalog.searchSuggestions);
router.get('/search/suggestions', catalog.searchSuggestions);
router.get('/restaurants', catalog.listRestaurants);
router.get('/restaurants/:id', catalog.restaurant);
router.get('/restaurants/:id/reviews', catalog.restaurantReviews);

export default router;
