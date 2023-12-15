const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true
  },
  isOrderCap: {
    type: String,
    default: "false"
  },
  OrderCap: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
