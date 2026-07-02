const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
  {
    originalName: String,
    savedName: String,
    diskPath: String,
    mimeType: String,
    extension: String,
    fileType: String,
    sizeBytes: Number,
    pages: Number,
    note: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      branch: { type: String, required: true, trim: true },
      yearSection: { type: String, required: true, trim: true },
      deliveryPlace: { type: String, required: true, trim: true },
      instructions: { type: String, trim: true, default: '' },
    },
    files: [FileSchema],
    options: {
      xeroxType: {
        type: String,
        enum: ['single', 'double', 'fourInOne'],
        default: 'single',
      },
      printColor: {
        type: String,
        enum: ['bw', 'color'],
        default: 'bw',
      },
      copies: { type: Number, default: 1, min: 1 },
    },
    summary: {
      totalPages: { type: Number, default: 0 },
      effectivePages: { type: Number, default: 0 },
      ratePerPage: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discountApplied: { type: Boolean, default: false },
      discountPercentage: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      minimumOrderAdjustment: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Printing', 'Ready for Pickup', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    upiLink: String,
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
