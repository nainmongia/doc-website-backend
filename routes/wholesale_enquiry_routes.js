const express = require("express");
const router = express.Router();
const equ = require("../controllers/WholeSaleEnquiry_Controller");

router.post('/wholesaleEnquiry', equ.addWholeSaleEnquiry);
router.get("/wholesaleEnquires/", equ.getWholeSaleEnquiries);
router.get("/search/wholesale", equ.searchWholeSaleEnquiry);
router.delete("/deleteWholesale", equ.deleteEnquiries);

module.exports = router;