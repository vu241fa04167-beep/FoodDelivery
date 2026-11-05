const express = require('express');
const router = express.Router();
const {
  getFoods, getFoodById, createFood, updateFood, deleteFood,
  getCategories, createCategory,
} = require('../controllers/foodController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getFoods).post(protect, admin, createFood);
router.route('/:id').get(getFoodById).put(protect, admin, updateFood).delete(protect, admin, deleteFood);
router.route('/categories').get(getCategories).post(protect, admin, createCategory);

module.exports = router;