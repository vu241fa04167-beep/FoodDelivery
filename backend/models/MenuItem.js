import mongoose from 'mongoose';

// Menu Item Schema for food items inside a restaurant
const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0 // Price in ₹
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
    },
    isVeg: {
      type: Boolean,
      required: true,
      default: true // true = Green Veg dot, false = Red Non-Veg dot
    },
    category: {
      type: String,
      required: true // e.g. Starters, Main Course, Biryani, Desserts
    },
    isAvailable: {
      type: Boolean,
      default: true // Restaurant owner can toggle in stock / out of stock
    }
  },
  {
    timestamps: true
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;

