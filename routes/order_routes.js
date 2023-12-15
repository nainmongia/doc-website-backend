const express = require("express")
const router = express.Router();
const Order_Controllers = require("../controllers/Order_Controller");

router.post('/create/new/order',Order_Controllers.createNewOrder);
router.get("/get/all/orders/",Order_Controllers.getAllOrders);

router.post("/get/all/orders/user",Order_Controllers.getAllOrdersByUserId);

router.get("/search/in/orders",Order_Controllers.searchInOrders);
router.get("/filter/by/orders",Order_Controllers.filterForOrders);
router.get("/get/order/by/id/:order_id",Order_Controllers.getOrderById);
router.patch("/change/order/status/:order_id",Order_Controllers.updateOrders);
router.delete("/delete/order/by/id",Order_Controllers.deleteOrders);
router.delete("/order/:id", Order_Controllers.deleteOrderById);
router.post('/order/status/:merchantTransactionId', Order_Controllers.checkStatus);
router.post('/pay', Order_Controllers.newPayment);

module.exports = router