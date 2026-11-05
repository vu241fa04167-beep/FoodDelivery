import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const foodSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  name: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  image: String,
  dietary: [{ type: String }], // 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Halal'
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

foodSchema.index({ restaurant: 1, isAvailable: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ name: 'text', description: 'text' });

export const Food = model('Food', foodSchema);
export default Food;

