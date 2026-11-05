import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const addressSchema = new Schema({
  label: { type: String, default: 'Home' }, // 'Home', 'Work', 'Other'
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  phone: String,
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: String,
  role: { type: String, enum: ['customer', 'restaurant', 'admin'], default: 'customer' },
  phone: { type: String, trim: true },
  addresses: [addressSchema],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }]
}, { timestamps: true });

export const User = model('User', userSchema);
export default User;

