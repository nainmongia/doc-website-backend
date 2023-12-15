const Orders_Schema = require("../modals/Orders");
const { verifying_Jwt } = require("../utils/Utils");
const Utils = require("../utils/Utils");
const order_status = require("../utils/configs/order_status");
const { v4: uuidv4 } = require("uuid");
const generateOrderId = require("order-id")("key");
const Products_Schema = require("../modals/Products");
const axios = require("axios");
const crypto = require("crypto");
const Users_Schema = require("../modals/Users");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();

  // Pad single-digit day and month with leading zeros
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  return `${year}-${formattedMonth}-${formattedDay}`;
};

// create new order
const createNewOrder = async (req, res) => {
  // console.log(req.body);
  try {
    // const getOrdersCount = await Orders_Schema.find().count()
    // console.log("order_00"+(getOrdersCount+1))
    // const ordersCustomId = "order_00"+(getOrdersCount+1)
    // const getOrderId = uuidv4();
    // const { jwt } = req.cookies;

    // if (!jwt) {
    //   console.log("nahi hai");
    //   return res.status(500).send({ message: "Please Login" });
    // }
    const userID = req.body?.customer_id;

    if (!userID) {
      return res.send({
        success: false,
        message: "Login and Try Again !!",
      });
    }

    // const _id = await Utils.verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);
    // console.log(_id);

    const user = await Users_Schema.findById(userID);
    const getOrderId = "order-" + generateOrderId.generate();
    //console.log(getOrderId);
    const create = new Orders_Schema({
      order_id: getOrderId,
      customer_phone_number: user.phone_number,
      customer_id: userID,
      tid: req.body.tid,
      customer_name: req.body.customer_name,
      total_amount: req.body.total_amount,
      customer_email: req.body.customer_email?.toLowerCase(),
      order_status: "pending",
      products: req.body.products,
      shipping_address: req.body.shipping_address,
      state: req.body?.state,
      pincode: req.body.pincode,
      customer_gst: req.body?.customer_gst,
      customer_business: req.body?.customer_business,
    });

    await updateProductQuantities(req.body.products);

    const result = await create.save();
    console.log("result------", result);

    // <******************************** shiprocket integration *******************************************************>
    const auth = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: "contact.dochomoeo@gmail.com",
        password: "Dochomoeo@123",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    const authToken = auth?.data?.token;

    console.log("authtoken", authToken);

    const newArray = create?.products?.map((item) => ({
      name: item.name,
      sku: item.code,
      units: item.cartQuantity,
      selling_price: item.price.toString(), // Convert price to string
      discount: "",
      tax: "",
      hsn: 441122,
    }));

    const numericPrice = parseFloat(
      create?.total_amount.replace(/[^\d.]/g, "")
    );

    const shipping = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        order_id: create?.order_id,
        order_date: formatDate(result?.createdAt),
        billing_customer_name: result?.customer_name,
        billing_last_name: "",
        billing_address: result?.shipping_address,
        billing_city: req.body?.town,
        billing_pincode: result?.pincode,
        billing_state: result?.state,
        billing_country: "India",
        billing_email: result?.customer_email,
        billing_phone: result?.customer_phone_number,
        shipping_is_billing: true,
        order_items: newArray,
        payment_method: "prepaid",
        sub_total: numericPrice,
        length: 10,
        breadth: 15,
        height: 20,
        weight: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        maxBodyLength: Infinity,
      }
    );
    console.log(shipping);

    if (shipping?.status !== parseInt(200)) {
      await create.delete();
      return res.status(500).send({
        status: false,
        message: "shipping error",
        result: result,
      });
    }
    res.status(200).send({
      status: true,
      message: "order created successfully !!",
      result: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const updateProductQuantities = async (cart) => {
  try {
    for (const cartItem of cart) {
      const product = await Products_Schema.findOne({
        _id: cartItem.productID,
      });

      if (product) {
        // Check if there's enough quantity in stock
        if (product.quantity < cartItem.cartQuantity) {
          throw new Error(
            `Not enough quantity in stock for product with ID: ${cartItem.productID}`
          );
        }

        // Decrease the product quantity based on the quantity ordered
        product.quantity -= cartItem.cartQuantity;

        // Save the updated product to MongoDB
        await product.save();
      }
    }
  } catch (error) {
    console.log(error);
    //  throw error; // Re-throw the error to be handled in the calling function (createNewOrder)
  }
};

// get all orders
const getAllOrders = async (req, res) => {
  try {
    const ordersCount = await Orders_Schema.find({}).count();
    const allOrders = await Orders_Schema.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      allOrders: allOrders,
      ordersCount: ordersCount,
      order_status: order_status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// get all orders
const getAllOrdersByUserId = async (req, res) => {
  try {
    // const { jwt } = req.cookies;

    // if (!jwt) {
    //   return res.send({
    //     success: false,
    //     message: "Login and Try Again !!",
    //   });
    // }

    // const token = verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);

    const userID = req.body?.user;

    if (!userID) {
      return res.send({
        success: false,
        message: "Login and Try Again !!",
      });
    }

    const user = await Users_Schema.findById(userID);
    console.log(user);

    if (!user) {
      return res.send({
        success: false,
        message: "User Not Found",
      });
    }
    // console.log(user);

    const allOrders = await Orders_Schema.find({
      customer_id: user._id,
    }).sort({ createdAt: -1 });

    //console.log(allOrders);

    res.status(200).send(allOrders);
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// GET ORDER BY ID
const getOrderById = async (req, res) => {
  const orderId = req.params.order_id;
  try {
    if (!orderId) {
      return res
        .status(404)
        .send({ status: 404, message: "order not found !!" });
    }
    const findOrder = await Orders_Schema.findById(orderId);
    if (!findOrder) {
      return res
        .status(404)
        .send({ status: 404, message: "order not found !!" });
    }
    res
      .status(200)
      .send({ status: true, result: findOrder, order_status: order_status });
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// CHNAGE ORDER STATUS
const updateOrders = async (req, res) => {
  const orderId = req.params.order_id;
  try {
    if (!orderId) {
      return res
        .status(404)
        .send({ status: false, message: "order updation failed !!" });
    }
    const updateOrder = await Orders_Schema.findByIdAndUpdate(orderId, {
      $set: req.body,
    });
    res.status(200).send({ status: true, message: "order updated success !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

//delete single order
const deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.id; // Assuming you pass the order ID as a route parameter

    console.log("orderid ===============================>", orderId);

    // Check if orderId is provided
    if (!orderId) {
      return res
        .status(400)
        .send({ message: "Order ID is required", status: false });
    }

    const deleteOrder = await Orders_Schema.findByIdAndDelete(orderId);

    if (!deleteOrder) {
      return res.status(404).send({
        message: "Order not found or could not be deleted",
        status: false,
      });
    }

    return res
      .status(200)
      .send({ message: "Order deleted successfully", status: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error", status: false });
  }
};

// DELETE ORDER's
const deleteOrders = async (req, res) => {
  try {
    if (req.body?.length) {
      const deleteSelected = await Orders_Schema.deleteMany({
        _id: {
          $in: req.body,
        },
      });
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "order delete failed", status: false });
      }
      return res
        .status(200)
        .send({ message: "order delete success", status: true });
    }

    res.status(200).send({ message: "order delete failed", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "order delete failed", status: false });
  }
};

// search in orders table
const searchInOrders = async (req, res) => {
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  // console.log("SEARCH===",searchValue)
  try {
    result = await Orders_Schema.find({
      order_id: { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await Orders_Schema.find({
        customer_name: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    const numberField = parseInt(searchValue);
    // console.log(numberField)
    if (numberField) {
      // console.log(numberField)
      result = await Orders_Schema.find({
        customer_phone_number: numberField,
      }).sort({ createdAt: -1 });
      return res.status(200).send(result);
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// FILTERS FOR ORDERS
const filterForOrders = async (req, res) => {
  const { by_status, date_from, date_to, recentDays } = req.query;
  let result;
  console.log(
    "by_status,date_from,date_to,recentDays",
    by_status,
    date_from,
    date_to,
    recentDays
  );
  try {
    // console.log("date====",Utils.convertDate(date_from),"-----",Utils.convertDate(date_to))
    const endDate = new Date(`${date_to}`);
    // seconds * minutes * hours * milliseconds = 1 day
    const dayTime = 60 * 60 * 24 * 1000;
    let increaseEndDateByOne = new Date(endDate.getTime() + dayTime);
    // console.log("INCREASED DATE",increaseEndDateByOne)

    // filter orders by todays date and by their status
    let user_status;
    if (date_from && date_to && by_status) {
      if (by_status != "all") {
        //  user_status = by_status == 'verified' ? true : false
        result = await Orders_Schema.aggregate([
          {
            $match: {
              order_status: by_status,
              createdAt: {
                $lte: Utils.convertDate(increaseEndDateByOne),
                $gte: Utils.convertDate(date_from),
              },
            },
          },
        ]).sort({ createdAt: -1 });
        console.log("RESULT NEW----", result);

        return res.status(200).send(result);
      }
    } else {
      result = await Orders_Schema.find({ order_status: by_status }).sort({
        createdAt: -1,
      });
      // return res.status(200).send(result)
    }

    if (date_from && date_to) {
      result = await Orders_Schema.aggregate([
        {
          $match: {
            createdAt: {
              $lte: Utils.convertDate(increaseEndDateByOne),
              $gte: Utils.convertDate(date_from),
            },
          },
        },
      ]).sort({ createdAt: -1 });
      console.log("RESULT NEW----", result);
      return res.status(200).send(result);
    }
    if (by_status != "all") {
      // let user_status = by_status === 'verified' ? true : false
      result = await Orders_Schema.find({ order_status: by_status }).sort({
        createdAt: -1,
      });
      console.log("RESULT NEW----", result);

      return res.status(200).send(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

//<----------------------------------------------------HANDLING PAYMENTS -------------------------------------------------->//

const newPayment = async (req, res) => {
  try {
    console.log(req.body);
    const merchantTransactionId = req.body.tid;
    var total = req.body.amount;
    total*=100;
    const data = {
      merchantId: process.env.Merchant_Id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.tuid,
      name: req.body.name,
      amount: total,
      redirectUrl: `https://shark-app-neruo.ondigitalocean.app/api/order/status/${merchantTransactionId}`,
    // redirectUrl: `http://localhost:5000/api/order/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.PHOENPE;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        // console.log(response.data.data);
        console.log(response.data.data.instrumentResponse.redirectInfo.url);
        return res.status(200).send({
          link: response.data.data.instrumentResponse.redirectInfo.url,
        });
        //return res.writeHead(301, { "Location": response.data.data.instrumentResponse.redirectInfo.url});
      })
      .catch(function (error) {
        //console.error(error);
      });
  } catch (error) {
   // console.log(error);
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatus = async (req, res) => {
  console.log(req.params);
  //console.log("body", req);
  const merchantTransactionId = req.params.merchantTransactionId;
  const merchantId = process.env.Merchant_Id;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    process.env.PHOENPE;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT TATUS
  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        const url = `http://dochomoeo.com/process`;
        return res.redirect(url);
      } else {
        const url = `https://dochomoeo.com/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

exports.createNewOrder = createNewOrder;
exports.getAllOrders = getAllOrders;
exports.searchInOrders = searchInOrders;
exports.filterForOrders = filterForOrders;
exports.getOrderById = getOrderById;
exports.updateOrders = updateOrders;
exports.deleteOrders = deleteOrders;
exports.getAllOrdersByUserId = getAllOrdersByUserId;
exports.deleteOrderById = deleteOrderById;
exports.checkStatus = checkStatus;
exports.newPayment = newPayment;
