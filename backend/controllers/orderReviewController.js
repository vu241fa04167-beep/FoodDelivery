import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

// GET /api/orders/restaurant - Owner views incoming orders for their restaurant
export const getOwnerOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Owner restaurant not found' });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status - Owner updates order status (strictly sequential)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('restaurant');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.restaurant?.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this order' });
    }

    // Sequence: placed > preparing > out_for_delivery > delivered (No skipping allowed)
    const validTransitions = {
      placed: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered'
    };

    const nextAllowed = validTransitions[order.orderStatus];
    if (!nextAllowed || status !== nextAllowed) {
      return res.status(400).json({
        message: `Invalid status transition from "${order.orderStatus}" to "${status}". Next allowed step is: "${nextAllowed || 'None'}"`
      });
    }

    order.orderStatus = status;

    // Assign random delivery partner when order is out for delivery
    if (status === 'out_for_delivery' && (!order.deliveryPartner || !order.deliveryPartner.name)) {
      const partnerCount = await DeliveryPartner.countDocuments();
      if (partnerCount > 0) {
        const rand = Math.floor(Math.random() * partnerCount);
        const partner = await DeliveryPartner.findOne().skip(rand);
        if (partner) {
          order.deliveryPartner = {
            name: partner.name,
            phone: partner.phone,
            vehicleNumber: partner.vehicleNumber
          };
        }
      }
    }

    await order.save();
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:id/review - Customer rates delivered order 1-5 stars (once only)
export const reviewOrder = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only review your own orders' });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'You can only review delivered orders' });
    }

    if (order.isReviewed) {
      return res.status(400).json({ message: 'This order has already been reviewed' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    order.rating = numRating;
    order.reviewComment = comment ? String(comment).trim() : '';
    order.isReviewed = true;
    await order.save();

    // Recalculate restaurant's average rating
    const reviewedOrders = await Order.find({ restaurant: order.restaurant, isReviewed: true });
    const totalRating = reviewedOrders.reduce((sum, o) => sum + o.rating, 0);
    const avgRating = Number((totalRating / reviewedOrders.length).toFixed(1));

    await Restaurant.findByIdAndUpdate(order.restaurant, {
      rating: avgRating,
      numRatings: reviewedOrders.length
    });

    res.json({ message: 'Review submitted successfully', order });
  } catch (error) {
    next(error);
  }
};

