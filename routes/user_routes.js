const express = require("express")
const router = express.Router()
const User_Controllers = require("../controllers/User_Controller")

// users all routes
router.get("/user/get/alluser",User_Controllers.getAllUser);
router.get("/user/get/user",User_Controllers.getUserById);
router.get("/user/get/:user_id",User_Controllers.getUser);
router.post("/user/create/newuser",User_Controllers.createUser);

router.post("/user/register", User_Controllers.registerUser);
router.post("/user/register_verify", User_Controllers.registerVerify);
router.post("/user/login_by_number", User_Controllers.loginUserByNumber);
router.post("/user/verify_login", User_Controllers.verifyOTPRegLog);
router.post("/user/loginUserData", User_Controllers.fetchLoginUserData);
// router.post("/user/payment_add_reword", User_Controllers.makePaymentAddRewards);
// router.post("/user/paymentVerifyRezor", User_Controllers.verifyPaymentRezor);
// router.post("/user/paymentVerifyRezorByReword", User_Controllers.verifyPaymentRezorByRewords);
router.post("/user/deleteUsersById", User_Controllers.deleteUsersById);

router.post("/user/login",User_Controllers.loginUser);
router.get("/user/logout",User_Controllers.logoutUser);
router.patch("/user/edit/:user_id",User_Controllers.editUserByID);
router.delete("/delete/users",User_Controllers.deleteUsers);
router.get("/search/in/user",User_Controllers.searchInUsers);
router.get("/filter/users",User_Controllers.filterForUsers);

module.exports = router