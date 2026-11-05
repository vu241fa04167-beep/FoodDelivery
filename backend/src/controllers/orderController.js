import { Cart, Order, Restaurant, Food, Review } from '../models/index.js';
import { calculateOrderTotals } from '../services/pricingService.js';
import { validateCheckoutInput } from '../validators/orderValidator.js';

export const checkout = async (req, res, next) => {
  try {
    const idempotencyKey = String(req.headers['idempotency-key'] || '').trim();
    if (idempotencyKey) {
      const existing = await Order.findOne({ customer: req.user._id, idempotencyKey });
      if (existing) return res.status(200).json(existing);
    }

    const valError = validateCheckoutInput(req.body);
    if (valError) return res.status(400).json({ message: valError });

    const { address, paymentMethod, deliveryInstructions, couponCode, tip = 0, deliverySpeed = 'standard' } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
    if (!cart?.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    if (cart.items.some(i => !i.food || !i.food.isAvailable)) {
      return res.status(409).json({ message: 'One or more items in your cart are no longer available. Please review your cart.' });
    }

    const restaurantId = cart.items[0].food.restaurant.toString();
    if (cart.items.some(i => i.food.restaurant.toString() !== restaurantId)) {
      return res.status(400).json({ message: 'All items must belong to the same restaurant' });
    }

    const restaurant = await Restaurant.findOne({ _id: restaurantId, approved: true });
    if (!restaurant) {
      return res.status(409).json({ message: 'This restaurant is currently not accepting orders' });
    }

    const items = cart.items.map(i => ({
      food: i.food._id,
      name: i.food.name,
      price: i.food.price,
      quantity: i.quantity,
      notes: i.notes || ''
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const totals = await calculateOrderTotals({
      subtotal,
      deliveryFee: restaurant.deliveryFee || 2.5,
      couponCode,
      tip,
      deliverySpeed
    });

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurant._id,
      items,
      deliveryAddress: address,
      deliveryInstructions: deliveryInstructions || '',
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'placed',
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tip: totals.tip,
      deliverySpeed: totals.deliverySpeed,
      priorityFee: totals.priorityFee,
      discount: totals.discount,
      couponCode: totals.appliedCoupon || undefined,
      total: totals.total,
      idempotencyKey: idempotencyKey || undefined,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed by customer'
      }]
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name image cuisines deliveryTime address')
      .sort('-createdAt')
      .lean();
    res.json(orders);
  } catch (e) {
    next(e);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image address phone deliveryTime')
      .populate('customer', 'name phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isCustomer = order.customer._id.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    let isOwner = false;
    if (req.user.role === 'restaurant') {
      const rest = await Restaurant.findOne({ owner: req.user._id });
      if (rest && order.restaurant._id.equals(rest._id)) isOwner = true;
    }

    if (!isCustomer && !isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (e) {
    next(e);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.customer.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own orders' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already ${order.status.replace(/_/g, ' ')}. Please contact the restaurant.`
      });
    }

    order.status = 'cancelled';
    order.cancelledBy = 'customer';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer'
    });

    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
};

export const restaurantOrders = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    const orders = await Order.find({ restaurant: r._id })
      .populate('customer', 'name email phone addresses')
      .sort('-createdAt');
    res.json(orders);
  } catch (e) {
    next(e);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const allowed = ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'];
    const { status, note } = req.body;
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const r = await Restaurant.findOne({ owner: req.user._id });
    const order = await Order.findById(req.params.id);

    if (!order || !r || !order.restaurant.equals(r._id)) {
      return res.status(404).json({ message: 'Order not found for this restaurant' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    if (status === 'rejected' || status === 'cancelled') {
      order.cancelledBy = 'restaurant';
      order.cancelReason = note || 'Declined by restaurant';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status.replace(/_/g, ' ')}`
    });

    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment, orderId } = req.body;
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'A rating between 1 and 5 is required' });
    }

    const order = await Order.findById(orderId);
    if (!order || !order.customer.equals(req.user._id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const existing = await Review.findOne({ order: order._id, customer: req.user._id });
    if (existing) {
      existing.rating = numRating;
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({
        restaurant: order.restaurant,
        customer: req.user._id,
        order: order._id,
        rating: numRating,
        comment: comment || ''
      });
    }

    const allReviews = await Review.find({ restaurant: order.restaurant });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(order.restaurant, {
      rating: Number(avg.toFixed(1)),
      numReviews: allReviews.length
    });

    res.status(201).json({ message: 'Thank you for your review!', rating: avg });
  } catch (e) {
    next(e);
  }
};
