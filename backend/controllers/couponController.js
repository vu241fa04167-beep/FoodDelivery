import Coupon from '../models/Coupon.js';

// POST /api/coupons/validate - Validate coupon and calculate discount
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({ message: 'Coupon code and orderTotal are required' });
    }

    const subtotal = Number(orderTotal);
    if (isNaN(subtotal) || subtotal <= 0) {
      return res.status(400).json({ message: 'orderTotal must be a positive number' });
    }

    // Lookup coupon by code (case insensitive uppercase)
    const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon has expired or is inactive' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (subtotal < coupon.minOrder) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrder} is required for coupon ${coupon.code}`
      });
    }

    // Calculate percentage discount capped at maxDiscount
    const calculatedDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
    const discount = Math.min(coupon.maxDiscount, calculatedDiscount);

    res.json({
      message: 'Coupon applied successfully',
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discount,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      finalTotal: Math.max(0, subtotal - discount)
    });
  } catch (error) {
    next(error);
  }
};

