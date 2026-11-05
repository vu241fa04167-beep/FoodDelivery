import mongoose from 'mongoose';

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        isVeg: { type: Boolean, default: true }
      }
    ],
    address: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed'
    },
    itemTotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 35
    },
    tax: {
      type: Number,
      default: 0 // 5% GST
    },
    discount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    grandTotal: {
      type: Number,
      required: true
    },
    estimatedDeliveryAt: {
      type: Date,
      required: true
    },
    // Ratings and Reviews (allowed once only after delivery)
    isReviewed: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    reviewComment: {
      type: String,
      default: ''
    },
    // Delivery Partner assigned when out for delivery
    deliveryPartner: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual alias for hasReviewed
orderSchema.virtual('hasReviewed').get(function () {
  return this.isReviewed;
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
