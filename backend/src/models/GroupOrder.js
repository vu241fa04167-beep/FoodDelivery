import mongoose from 'mongoose';
import { addressSchema } from './User.js';

const { Schema, model } = mongoose;

const groupOrderSchema = new Schema({
  code: { type: String, unique: true, index: true, uppercase: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  items: [{
    food: { type: Schema.Types.ObjectId, ref: 'Food' },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1, default: 1 },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    addedByName: String,
    notes: String
  }],
  status: { type: String, enum: ['open', 'checked_out', 'cancelled'], default: 'open' },
  associatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

groupOrderSchema.index({ creator: 1, status: 1 });
groupOrderSchema.index({ restaurant: 1 });

export const GroupOrder = model('GroupOrder', groupOrderSchema);
export default GroupOrder;

