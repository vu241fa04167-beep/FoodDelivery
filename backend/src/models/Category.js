import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  image: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = model('Category', categorySchema);
export default Category;

