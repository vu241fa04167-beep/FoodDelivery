import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

// GET /api/admin/stats - Overview counts and revenue
export const getAdminStats = async (req, res, next) => {
  try {
    const [usersCount, restaurantsCount, ordersCount] = await Promise.all([
      User.countDocuments(), Restaurant.countDocuments(), Order.countDocuments()
    ]);
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
    ]);
    res.json({ usersCount, restaurantsCount, ordersCount, totalRevenue: revenueAgg[0]?.totalRevenue || 0 });
  } catch (error) { next(error); }
};

// GET /api/admin/orders - Admin view of incoming customer orders
export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name area deliveryTime')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(orders);
  } catch (error) { next(error); }
};

// GET /api/admin/restaurants - List all restaurants (pending first)
export const getAdminRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email phone').sort({ createdAt: -1 });
    const sorted = [...restaurants].sort((a, b) => (a.status === 'pending' ? -1 : b.status === 'pending' ? 1 : 0));
    res.json(sorted);
  } catch (error) { next(error); }
};

// PATCH /api/admin/restaurants/:id/status - Approve or reject restaurant
export const updateRestaurantApproval = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    restaurant.status = status;
    restaurant.isApproved = status === 'approved';
    await restaurant.save();
    res.json({ message: `Restaurant ${status} successfully`, restaurant });
  } catch (error) { next(error); }
};

// GET /api/admin/coupons - List all coupons
export const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) { next(error); }
};

// POST /api/admin/coupons - Create new coupon
export const createAdminCoupon = async (req, res, next) => {
  try {
    const { code, discountPercent, maxDiscount, minOrder, expiryDate, isActive } = req.body;
    if (!code || discountPercent === undefined) {
      return res.status(400).json({ message: 'Coupon code and discountPercent are required' });
    }
    const upperCode = String(code).trim().toUpperCase();
    const existing = await Coupon.findOne({ code: upperCode });
    if (existing) return res.status(400).json({ message: 'A coupon with this code already exists' });

    const coupon = await Coupon.create({
      code: upperCode,
      discountPercent: Number(discountPercent),
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : 100,
      minOrder: minOrder !== undefined ? Number(minOrder) : 199,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) { next(error); }
};

// PUT /api/admin/coupons/:id - Edit coupon
export const updateAdminCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    const { discountPercent, maxDiscount, minOrder, expiryDate, isActive } = req.body;
    if (discountPercent !== undefined) coupon.discountPercent = Number(discountPercent);
    if (maxDiscount !== undefined) coupon.maxDiscount = Number(maxDiscount);
    if (minOrder !== undefined) coupon.minOrder = Number(minOrder);
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    await coupon.save();
    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) { next(error); }
};

// DELETE /api/admin/coupons/:id - Delete coupon
export const deleteAdminCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) { next(error); }
};
