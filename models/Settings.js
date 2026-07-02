const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    shopName: { type: String, default: 'College Xerox Hub' },
    whatsappNumber: { type: String, default: '919999999999' },
    upiId: { type: String, default: 'admin@upi' },
    singleSideRate: { type: Number, default: 2 },
    doubleSideRate: { type: Number, default: 1.5 },
    fourInOneRate: { type: Number, default: 1 },
    colorRate: { type: Number, default: 8 },
    minimumOrderAmount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 10 },
    discountMinPdfs: { type: Number, default: 10 },
    discountMinPagesPerPdf: { type: Number, default: 50 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
