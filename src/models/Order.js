import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'AGRI_INPUT',
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    sellerName: {
      type: String,
      default: 'Sovereign Agro Vendor',
    },
  },
  { _id: false }
);

const timelineStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    current: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    buyer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },
    items: [orderItemSchema],
    deliveryAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land' },
      landName: { type: String, default: 'Primary Registered Plot' },
      addressLine: { type: String, required: true },
      village: { type: String, default: '' },
      district: { type: String, default: 'Anand' },
      state: { type: String, default: 'Gujarat' },
      pincode: { type: String, required: true },
    },
    billing: {
      subtotal: { type: Number, required: true },
      discountAmount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      couponCode: { type: String, default: null },
    },
    payment: {
      method: {
        type: String,
        enum: ['WALLET', 'UPI', 'CARD', 'NET_BANKING', 'CASH_ON_DELIVERY'],
        default: 'WALLET',
      },
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PAID',
      },
      transactionRef: { type: String },
      paidAt: { type: Date, default: Date.now },
    },
    fulfillment: {
      status: {
        type: String,
        enum: [
          'PLACED',
          'CONFIRMED',
          'PACKING',
          'DISPATCHED',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
        ],
        default: 'CONFIRMED',
      },
      courier: {
        type: String,
        default: 'Kisan Express Agri-Logistics',
      },
      trackingNumber: {
        type: String,
        default: function () {
          return `KEL-${Math.floor(100000 + Math.random() * 900000)}`;
        },
      },
      estimatedDelivery: {
        type: String,
        default: '3-5 Business Days',
      },
      deliveredAt: {
        type: Date,
      },
    },
    timeline: [timelineStepSchema],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ 'buyer.userId': 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
