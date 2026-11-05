import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [{
    food: { type: Schema.Types.ObjectId, ref: 'Food' },
    quantity: { type: Number, min: 1, default: 1 },
    notes: String
  }]
}, { timestamps: true });

export const Cart = model('Cart', cartSchema);
export default Cart;

