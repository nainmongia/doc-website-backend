const Coupon = require("../modals/Coupon");
const Utils = require("../utils/Utils");

// Add a new coupon
exports.addCoupon = async (req, res) => {
  console.log(req.body);
  try {
    const coupon = new Coupon({
      title: req.body?.title,
      description: req.body?.description,
      isOrderCap: req.body?.isOrderCap,
      OrderCap: req.body?.OrderCap,
      discountValue: req.body?.discountValue,
      discountType: req.body?.discountType,
      expiryDate: req.body?.expiryDate,
    });
    await coupon.save();
    res.status(201).json({ message: "Coupon added successfully", coupon });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// SEARCH IN Coupons
exports.searchCoupons = async (req, res) => {
  const searchValue = req.query.search;
  console.log(searchValue);
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  try {
    result = await Coupon.find({
      title: { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await Coupon.find({
        discountType: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    if (!result.length > 0) {
      result = await Coupon.find({
        discountValue: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    if (!result.length > 0) {
      result = await Coupon.find({
        expiryDate: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }

    console.log(result);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// Delete a coupon by its ID
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndRemove(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon deleted successfully", coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a coupon by its ID
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon updated successfully", coupon });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a coupon by its title
exports.getCouponByTitle = async (req, res) => {
  console.log(req.params.title);
  const searchRegex = req.params?.title;
  const total = req.params?.total;
  console.log(total);
  try {
    const coupon = await Coupon.findOne({ title: searchRegex });
    console.log(coupon);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not valid" });
    }

    if (coupon.isOrderCap === "true" && coupon.OrderCap > total) {
      return res.status(404).json({
        message: `You need to add ${
          coupon.OrderCap - total
        } more to apply this coupon`,
      });
    }

    // Check if the coupon has expired
    if (coupon.expiryDate < new Date()) {
      return res.status(404).json({ message: "Invalid coupon" });
    }

    // console.log(coupon);

    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete products
exports.deleteCoupons = async (req, res) => {
  // console.log("body=>",req.body)
  // console.log("body=>",req.body?.length)
  try {
    if (req.body?.length) {
      const deleteSelected = await Coupon.deleteMany({
        _id: {
          $in: req.body,
        },
      });
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "Coupon delete failed", status: false });
      }
      return res
        .status(200)
        .send({ message: "Coupon delete success", status: true });
    }

    res.status(200).send({ message: "coupon delete failed", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "coupon delete failed", status: false });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    // // Filter out expired coupons
    // const validCoupons = coupons.filter(coupon => coupon.expiryDate >= new Date());

    res.status(200).json({ coupons: coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get coupons for client
exports.clientCoupons = async (req, res) => {
  try {
    const r = await Coupon.find().limit(5);
   // console.log(r);

    // // Filter out expired coupons
    // const validCoupons = coupons.filter(coupon => coupon.expiryDate >= new Date());

    res.status(200).json({ coupons: r });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a coupon by its total percentage or amount of discount
exports.getCouponByDiscount = async (req, res) => {
  try {
    const { discountType, discountValue } = req.query;
    const query = {
      discountType,
      discountValue,
    };

    const coupons = await Coupon.find(query);

    if (coupons.length === 0) {
      return res
        .status(404)
        .json({ message: "No coupons found with the specified discount" });
    }

    // Filter out expired coupons
    const validCoupons = coupons.filter(
      (coupon) => coupon.expiryDate >= new Date()
    );

    res.status(200).json({ coupons: validCoupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
