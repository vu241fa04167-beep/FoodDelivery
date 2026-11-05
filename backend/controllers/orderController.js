import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Coupon from '../models/Coupon.js';

// POST /api/orders - Create a new customer order
export const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, address, paymentMethod = 'cod', couponCode } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0 || items.length > 50 || typeof address !== 'string' || !address.trim() || address.trim().length > 500) {
      return res.status(400).json({ message: 'Restaurant, items and delivery address are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isApproved) {
      return res.status(404).json({ message: 'Restaurant not found or not active' });
    }

    let itemTotal = 0;
    const orderItems = [];

    // Verify all items from database (never trust client prices)
    for (const item of items) {
      if (!item || typeof item !== 'object' || !item.menuItemId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 20) {
        return res.status(400).json({ message: 'Each item must have a valid menu item and quantity between 1 and 20' });
      }
      const dbItem = await MenuItem.findById(item.menuItemId);
      if (!dbItem) {
        return res.status(400).json({ message: `Item with id ${item.menuItemId} does not exist` });
      }

      if (dbItem.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(400).json({ message: 'All items in an order must be from the same restaurant' });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({ message: `"${dbItem.name}" is currently sold out` });
      }

      const qty = Number(item.quantity);
      itemTotal += dbItem.price * qty;

      orderItems.push({ menuItem: dbItem._id, name: dbItem.name, price: dbItem.price, quantity: qty, isVeg: dbItem.isVeg });
    }

    // Delivery fee is flat ₹30, free for orders above ₹500
    const deliveryFee = itemTotal >= 500 ? 0 : 30;
    const tax = Math.round(itemTotal * 0.05); // 5% GST
    let discount = 0, validCouponCode = '';

    // Coupon verification on server
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true });
      const notExpired = !coupon?.expiryDate || new Date(coupon.expiryDate) >= new Date();
      if (coupon && notExpired && itemTotal >= coupon.minOrder) {
        discount = Math.min(coupon.maxDiscount, Math.round((itemTotal * coupon.discountPercent) / 100));
        validCouponCode = coupon.code;
      }
    }

    const grandTotal = Math.max(0, itemTotal + deliveryFee + tax - discount);
    if (typeof paymentMethod !== 'string' || !['cod', 'online'].includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({ message: 'paymentMethod must be cod or online' });
    }
    const pMethod = paymentMethod.toLowerCase();
    const pStatus = pMethod === 'online' ? 'paid' : 'pending';
    const deliveryWindow = String(restaurant.deliveryTime || '30-40 mins').match(/(\d+)\s*-\s*(\d+)/);
    const estimatedMinutes = deliveryWindow ? Math.round((Number(deliveryWindow[1]) + Number(deliveryWindow[2])) / 2) : 35;
    const estimatedDeliveryAt = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    let order = await Order.create({
      customer: req.user._id, restaurant: restaurant._id, items: orderItems,
      address: address.trim(), paymentMethod: pMethod, paymentStatus: pStatus, orderStatus: 'placed',
      itemTotal, deliveryFee, tax, discount, couponCode: validCouponCode, grandTotal, estimatedDeliveryAt
    });

    // Populate restaurant details for immediate response
    order = await order.populate('restaurant', 'name image area address phone');
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/mine - Customer's own orders (newest first)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name image area deliveryTime')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - View single order details (Customer, Owner, or Admin)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name image address area phone owner deliveryTime');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isCustomer = (order.customer?._id || order.customer)?.toString() === req.user._id.toString();
    const isOwner = (order.restaurant?.owner?._id || order.restaurant?.owner)?.toString() === req.user._id.toString();
    if (!isCustomer && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/cancel - Customer cancels order (only while status is 'placed')
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only cancel your own orders' });
    }

    if (order.orderStatus !== 'placed') {
      return res.status(400).json({ message: `Cannot cancel order. Order is already ${order.orderStatus}` });
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};
