import mongoose from 'mongoose';
import { addressSchema } from './User.js';

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    food: { type: Schema.Types.ObjectId, ref: 'Food' },
    name: String,
    price: Number,
    quantity: Number,
    notes: String
  }],
  deliveryAddress: addressSchema,
  deliveryInstructions: String,
  paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'],
    default: 'placed'
  },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 2.5 },
  tip: { type: Number, default: 0, min: 0 },
  deliverySpeed: { type: String, enum: ['standard', 'priority'], default: 'standard' },
  priorityFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  idempotencyKey: { type: String, index: true, sparse: true },
  cancelReason: String,
  cancelledBy: { type: String, enum: ['customer', 'restaurant', 'admin'] },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = model('Order', orderSchema);
export default Order;

