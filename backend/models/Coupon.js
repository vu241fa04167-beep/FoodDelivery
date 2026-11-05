import mongoose from 'mongoose';

// Coupon Schema for discounts
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    maxDiscount: {
      type: Number,
      default: 100 // Maximum discount in ₹
    },
    minOrder: {
      type: Number,
      default: 199 // Minimum order amount to apply in ₹
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;

