const express = require("express")
const router = express.Router();
const Mobilebanner_Controller = require('../controllers/MobileBanner_controller');

router.get("/mobile/get/all/banners",Mobilebanner_Controller.getAllbanners);
router.post('/mobile/add/new/banner',Mobilebanner_Controller.addNewBanner);
router.patch("/mobile/change/banner/by/id/:banner_id",Mobilebanner_Controller.changeBanner);
router.delete("/mobile/delete/banner/by/id/:banner_id",Mobilebanner_Controller.deleteBanner);

module.exports = router