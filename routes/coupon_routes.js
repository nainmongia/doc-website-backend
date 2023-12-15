const express = require('express');
const router = express.Router();
const couponController = require('../controllers/Coupon_Controller');

// Add a new coupon
router.post('/add', couponController.addCoupon);

// Delete a coupon by its ID
router.delete('/delete/:id', couponController.deleteCoupon);

// Update a coupon by its ID
router.put('/update/:id', couponController.updateCoupon);

// Get a coupon by its title
router.get('/title/:title/:total', couponController.getCouponByTitle);

// delete products
router.delete('/delete', couponController.deleteCoupons);

// Get a coupon by its title
router.get('/search', couponController.searchCoupons);

// Get a coupon by discount type and value
router.get('/discount', couponController.getCouponByDiscount);

// Get all coupons
router.get('/all', couponController.getAllCoupons);

// Get client coupons
router.get('/to', couponController.clientCoupons);

module.exports = router;
