import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const restaurantSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  description: String,
  cuisines: [{ type: String, trim: true }],
  image: String,
  coverImage: String,
  address: String,
  city: { type: String, default: 'New York' },
  phone: String,
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '25-35 min' },
  deliveryFee: { type: Number, default: 2.5 },
  minOrder: { type: Number, default: 15 },
  priceRange: { type: String, default: '$$' },
  isOpen: { type: Boolean, default: true },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

restaurantSchema.index({ approved: 1, isOpen: 1, rating: -1 });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ name: 'text', cuisines: 'text' });

export const Restaurant = model('Restaurant', restaurantSchema);
export default Restaurant;

