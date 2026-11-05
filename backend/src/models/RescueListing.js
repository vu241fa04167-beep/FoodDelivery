import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const rescueListingSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  name: { type: String, required: true },
  description: String,
  originalPrice: { type: Number, min: 0, required: true },
  discountedPrice: { type: Number, min: 0, required: true },
  quantity: { type: Number, min: 0, required: true },
  initialQuantity: { type: Number, default: 5 },
  isAvailable: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

rescueListingSchema.index({ isAvailable: 1, expiresAt: 1, quantity: 1 });
rescueListingSchema.index({ restaurant: 1 });

export const RescueListing = model('RescueListing', rescueListingSchema);
export default RescueListing;

