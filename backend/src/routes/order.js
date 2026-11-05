const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrderById, updateOrderStatus, updatePaymentStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/').post(createOrder).get(protect, admin, getOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/payment').put(protect, admin, updatePaymentStatus);

module.exports = router;