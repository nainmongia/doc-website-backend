const wholeSaleEnquirySchema = require("../modals/WholesaleEnquiry");
const Doctors = require("../modals/Doctors");
const Utils = require("../utils/Utils");

const addWholeSaleEnquiry = async (req, res) => {
    const newWholeSaleEnquiry = new wholeSaleEnquirySchema({...req.body});
    const product = await Doctors.find({ product_code: newWholeSaleEnquiry.productCode });
    if (!product[0]) return res.status(401).send('product not found ! Invalid product code');
    try {
      const savedwholesaleEnquiry = await newWholeSaleEnquiry.save();
      res.status(200).json(savedwholesaleEnquiry);
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong !!");
    }
  };
  
  const getWholeSaleEnquiries = async (req, res) => {
    try {
      const allEnquiries = await wholeSaleEnquirySchema.find();
      res.status(200).json(allEnquiries);
    } catch (error) {
      res.status(500).send("Something went wrong !!");
    }
  };

  // SEARCH IN WHOLESALE ENQUIRY
const searchWholeSaleEnquiry = async (req, res) => {
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  try {
    result = await wholeSaleEnquirySchema.find({
      productCode : { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await wholeSaleEnquirySchema.find({
        productName: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    if (!result.length > 0) {
      result = await wholeSaleEnquirySchema.find({
        name : { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    if (!result.length > 0) {
      result = await wholeSaleEnquirySchema.find({
        phoneNumber: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// DELETE Enquires
const deleteEnquiries = async (req, res) => {
  try {
    if (req.body?.length) {
      const deleteSelected = await wholeSaleEnquirySchema.deleteMany({
        _id: {
          $in: req.body,
        },
      });
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "Enquiries delete failed", status: false });
      }
      return res
        .status(200)
        .send({ message: "Enquiries delete success", status: true });
    }

    res.status(200).send({ message: "Enquiries delete failed", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "Enquiries delete failed", status: false });
  }
};

  exports.searchWholeSaleEnquiry = searchWholeSaleEnquiry;
  exports.addWholeSaleEnquiry = addWholeSaleEnquiry;
  exports.getWholeSaleEnquiries = getWholeSaleEnquiries;
  exports.deleteEnquiries = deleteEnquiries;
  