import mongoose from 'mongoose';

// Restaurant Schema
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    cuisine: {
      type: String,
      required: true,
      index: true
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
    },
    address: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true // e.g. Koramangala, Indiranagar, HSR Layout
    },
    rating: {
      type: Number,
      default: 4.2
    },
    numRatings: {
      type: Number,
      default: 0
    },
    deliveryTime: {
      type: String,
      default: '30-40 mins'
    },
    deliveryFee: {
      type: Number,
      default: 35 // in ₹
    },
    minOrder: {
      type: Number,
      default: 150 // in ₹
    },
    priceForTwo: {
      type: Number,
      default: 300 // in ₹ (for price low to high sorting)
    },
    isPureVeg: {
      type: Boolean,
      default: false // true if all items in restaurant are vegetarian
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      index: true,
      default: 'pending' // starts pending until admin approves
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
