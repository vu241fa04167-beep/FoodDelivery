import { Cart, Food, Coupon } from '../models/index.js';
import { calculateDiscount } from '../services/pricingService.js';

const getPopulatedCart = async (user) => {
  return Cart.findOne({ user }).populate({
    path: 'items.food',
    populate: { path: 'restaurant', select: 'name deliveryFee minOrder image' }
  });
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await getPopulatedCart(req.user._id);
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(i => i.food && i.food.isAvailable);
    if (cart.items.length !== initialCount) {
      await cart.save();
      cart = await getPopulatedCart(req.user._id);
    }
    res.json(cart || { items: [] });
  } catch (e) {
    next(e);
  }
};

export const changeCart = async (req, res, next) => {
  try {
    const { foodId, quantity, notes } = req.body;
    if (!foodId || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Valid food item ID and non-negative integer quantity are required' });
    }
    if (quantity > 30) {
      return res.status(400).json({ message: 'Maximum quantity per item is 30' });
    }

    const food = await Food.findById(foodId).populate('restaurant', 'name isOpen approved');
    if (!food || !food.isAvailable) {
      return res.status(404).json({ message: 'This menu item is currently unavailable' });
    }
    if (!food.restaurant?.approved) {
      return res.status(400).json({ message: 'This restaurant is not currently taking orders' });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const currentItem = cart.items.find(i => i.food?._id.equals(foodId));
    const existingRestaurant = cart.items.find(i => i.food)?.food?.restaurant?.toString();

    if (quantity > 0 && existingRestaurant && existingRestaurant !== food.restaurant._id.toString()) {
      return res.status(409).json({
        message: `Your cart contains items from another restaurant. Please clear your cart first before ordering from ${food.restaurant.name}.`,
        conflict: true
      });
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(i => !i.food?._id.equals(foodId));
    } else if (currentItem) {
      currentItem.quantity = quantity;
      if (notes !== undefined) currentItem.notes = notes;
    } else {
      cart.items.push({ food: foodId, quantity, notes: notes || '' });
    }

    await cart.save();
    res.json(await getPopulatedCart(req.user._id));
  } catch (e) {
    next(e);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ items: [] });
  } catch (e) {
    next(e);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Promo code is required' });

    const cart = await getPopulatedCart(req.user._id);
    const subtotal = (cart?.items || []).reduce(
      (sum, item) => sum + (item.food?.price || 0) * item.quantity,
      0
    );

    const { discount, appliedCoupon, coupon } = await calculateDiscount(subtotal, code);

    if (!appliedCoupon) {
      const c = await Coupon.findOne({ code });
      if (!c) return res.status(404).json({ message: 'Invalid or expired promo code' });
      if (c.expiresAt && c.expiresAt < new Date()) {
        return res.status(400).json({ message: 'This promo code has expired' });
      }
      if (c.minOrder && subtotal < c.minOrder) {
        return res.status(400).json({
          message: `Minimum order amount of $${c.minOrder.toFixed(2)} required for code ${code}`
        });
      }
      return res.status(400).json({ message: 'Promo code could not be applied' });
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      description: coupon.description
    });
  } catch (e) {
    next(e);
  }
};
