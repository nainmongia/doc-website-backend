const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  cap: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
