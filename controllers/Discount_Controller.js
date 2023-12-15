const Discount = require("../modals/Discount");
//<--------------------------------------------Delivery discount Charges----------------------------------------------->
// Add Discount
exports.addDiscount = async (req, res) => {
  try {
    const discount = new Discount({
      cap: req.body?.cap,
      amount: req.body?.amount
    });
    await discount.save();
    res.status(201).json({ message: "Discount added successfully", discount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update discount by its ID
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!discount) {
      return res.status(404).json({ message: "Discount amount not found" });
    }
    res.status(200).json({ message: "Discount updated successfully", discount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get discount
exports.getDiscount = async (req, res) => {
    try {
      const dis = await Discount.find();
      if (!dis) {
        return res.status(404).json({ message: "Discount amount not found" });
      }
      const discount = dis[0];
      res.status(200).json({ message: "Discount updated successfully", discount });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

