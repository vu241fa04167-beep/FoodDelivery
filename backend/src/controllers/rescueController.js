import { RescueListing, Restaurant, Food, Order } from '../models/index.js';
import { decrementRescueStock } from '../services/inventoryService.js';

export const listRescue = async (req, res, next) => {
  try {
    const listings = await RescueListing.find({
      isAvailable: true,
      quantity: { $gt: 0 }
    })
      .populate('restaurant', 'name image address rating deliveryTime deliveryFee')
      .populate('food', 'name image category')
      .sort('-createdAt')
      .lean();

    res.json(listings);
  } catch (e) {
    next(e);
  }
};

export const createRescue = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    const { foodId, originalPrice, discountedPrice, quantity, description } = req.body;
    const food = await Food.findOne({ _id: foodId, restaurant: r._id });
    if (!food) return res.status(404).json({ message: 'Menu item not found in your restaurant' });

    const original = Number(originalPrice !== undefined ? originalPrice : food.price);
    const discounted = Number(discountedPrice);
    const q = Number(quantity);

    if (!Number.isFinite(discounted) || discounted <= 0 || discounted >= original) {
      return res.status(400).json({ message: 'Discounted price must be greater than $0 and less than original price' });
    }
    if (!Number.isInteger(q) || q < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const listing = await RescueListing.create({
      restaurant: r._id,
      food: food._id,
      name: food.name,
      description: description || 'End-of-service surplus rescued in prime condition.',
      originalPrice: original,
      discountedPrice: discounted,
      quantity: q,
      initialQuantity: q,
      isAvailable: true
    });

    res.status(201).json(listing);
  } catch (e) {
    next(e);
  }
};

export const restaurantRescueList = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id }).lean();
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    const listings = await RescueListing.find({ restaurant: r._id })
      .populate('food', 'name image price')
      .sort('-createdAt')
      .lean();
    res.json(listings);
  } catch (e) {
    next(e);
  }
};

export const updateRescueListing = async (req, res, next) => {
  try {
    const r = await Restaurant.findOne({ owner: req.user._id });
    if (!r) return res.status(404).json({ message: 'Restaurant profile not found' });

    const { quantity, isAvailable, discountedPrice } = req.body;
    const listing = await RescueListing.findOne({ _id: req.params.id, restaurant: r._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (quantity !== undefined) listing.quantity = Math.max(0, Number(quantity));
    if (isAvailable !== undefined) listing.isAvailable = Boolean(isAvailable);
    if (discountedPrice !== undefined) listing.discountedPrice = Number(discountedPrice);

    if (listing.quantity === 0) listing.isAvailable = false;

    await listing.save();
    res.json(listing);
  } catch (e) {
    next(e);
  }
};

export const buyRescue = async (req, res, next) => {
  try {
    const q = Number(req.body.quantity || 1);
    const { address, paymentMethod = 'cod' } = req.body;

    if (!Number.isInteger(q) || q < 1 || q > 10) {
      return res.status(400).json({ message: 'Valid quantity (1 to 10) is required' });
    }

    const fallbackAddr = req.user.addresses?.find(a => a.isDefault) || req.user.addresses?.[0] || {
      line1: 'Standard Delivery Address',
      city: 'New York',
      state: 'NY',
      postalCode: '10001'
    };
    const activeAddress = (address?.line1 && address?.city) ? address : fallbackAddr;

    const listing = await decrementRescueStock(req.params.id, q);

    if (!listing) {
      return res.status(409).json({ message: 'Insufficient surplus stock. Listing may have just sold out.' });
    }

    const subtotal = listing.discountedPrice * q;
    const deliveryFee = listing.restaurant?.deliveryFee || 2.5;
    const total = Number((subtotal + deliveryFee).toFixed(2));

    const order = await Order.create({
      customer: req.user._id,
      restaurant: listing.restaurant._id,
      items: [{
        food: listing.food,
        name: `[FOOD RESCUE] ${listing.name}`,
        price: listing.discountedPrice,
        quantity: q,
        notes: 'Food Rescue surplus item'
      }],
      deliveryAddress: activeAddress,
      deliveryInstructions: 'Food Rescue order',
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'placed',
      subtotal,
      deliveryFee,
      total,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: `Food rescue item reserved by customer (${q} portion${q > 1 ? 's' : ''})`
      }]
    });

    res.status(201).json({
      order,
      remainingStock: listing.quantity
    });
  } catch (e) {
    next(e);
  }
};
