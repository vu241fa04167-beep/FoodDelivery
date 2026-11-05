import { Coupon } from '../models/index.js';

export const calculateDiscount = async (subtotal, couponCode) => {
  if (!couponCode) return { discount: 0, appliedCoupon: null };

  const cleanCode = String(couponCode).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode, active: true });

  if (!coupon) return { discount: 0, appliedCoupon: null };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { discount: 0, appliedCoupon: null };
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { discount: 0, appliedCoupon: null };
  }

  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return {
    discount: Number(discount.toFixed(2)),
    appliedCoupon: coupon.code,
    coupon
  };
};

export const calculateOrderTotals = async ({
  subtotal,
  deliveryFee = 2.5,
  couponCode = null,
  tip = 0,
  deliverySpeed = 'standard'
}) => {
  const { discount, appliedCoupon, coupon } = await calculateDiscount(subtotal, couponCode);
  const cleanTip = Math.max(0, Number(tip) || 0);
  const priorityFee = deliverySpeed === 'priority' ? 1.99 : 0;
  const rawTotal = subtotal + deliveryFee + priorityFee + cleanTip - discount;
  const total = Number(Math.max(0, rawTotal).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    tip: Number(cleanTip.toFixed(2)),
    deliverySpeed: deliverySpeed === 'priority' ? 'priority' : 'standard',
    priorityFee: Number(priorityFee.toFixed(2)),
    discount,
    appliedCoupon,
    coupon,
    total
  };
};


