const express = require('express');
const router = express.Router();
const discountController = require('../controllers/Discount_Controller');

// Add a new coupon
router.post('/delivey/add', discountController.addDiscount);

// Update a coupon by its ID
router.put('/delivery/update/:id', discountController.updateDiscount);

//get discount
router.get("/delivery/get",discountController.getDiscount);

module.exports = router;
