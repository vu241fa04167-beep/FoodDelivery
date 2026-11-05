import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'fixed' },
  discountValue: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  description: String,
  active: { type: Boolean, default: true },
  expiresAt: Date
}, { timestamps: true });

export const Coupon = model('Coupon', couponSchema);
export default Coupon;

