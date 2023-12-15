const Users_Schema = require("../modals/Users");
const Products_Schema = require("../modals/Products");
const Utils = require("../utils/Utils");
const { v4: uuidv4 } = require("uuid");
//const { instance } = require("./PaymentController");
const crypto = require("crypto");
const Orders_Schema = require("../modals/Orders");
const generateOrderId = require("order-id")("key");
const otp_service = require("../utils/otp");
// const msg91 = require("msg91").default;

// msg91.initialize({ authKey: process.env.MSG_AUTH_KEY });

const Order_Schema = require("../modals/Orders");

// creating new user
const createUser = async (req, res) => {
  const {
    firstname,
    gst_number,
    pincode,
    state,
    country,
    username,
    lastname,
    profile,
    phone_number,
    address,
    location,
    email,
    password,
    user_type,
  } = req.body;
  try {
    const findUserPhone = await Users_Schema.findOne({
      phone_number: phone_number,
    });
    if (findUserPhone) {
      return res.send("User Already Exists !!");
    }
    const findUser = await Users_Schema.findOne({ email: email });
    if (findUser) {
      return res.send("User Already Exists !!");
    }
    // creating user id
    // const getUserCount = await Users_Schema.find({}).count();
    // const getUserId = "user00"+(getUserCount+1);
    const getUserId = uuidv4();
    console.log(getUserId);
    // const currentDate = new Date().toUTCString()
    // const hashedPassword = await Utils.Hashing_Password(password)
    const create = new Users_Schema({
      user_id: getUserId,
      // firstname:firstname?.toLowerCase(),
      // lastname:lastname?.toLowerCase(),
      username: username?.toLowerCase(),
      // profile:profile,
      phone_number: phone_number,
      email: email,
      joining_date: new Date().toUTCString(),
      pincode: pincode,
      gst_number: gst_number,
      state: state?.toLowerCase(),
      country: country?.toLowerCase(),
      // password:hashedPassword,
      address: address,
      // user_type:user_type?.toLowerCase()
    });
    const result = await create.save();
    res
      .status(200)
      .send({ result: result, message: "created user successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const registerUser = async (req, res) => {
  const username = req.body.username;
  const phone_number = req.body.phone_number;
  try {
    if (!username || !phone_number) {
      return res.send("Please fill all the Field !!");
    }
    if (!(phone_number.length >= 10)) {
      return res.send("Please Enter valid phone number !!");
    }
    const searchUser = await Users_Schema.findOne({ phone_number });
    if (searchUser) {
      if (searchUser?.veifyedUser === true) {
        console.log("already");
        return res.send({
          message: "User Already Exists please login !!",
          success: false,
        });
      } else {
        // await Utils.sendPhoneOTP(phone_number);

        const resp = await otp_service.sendOtpToNumber(Number(phone_number));

        if (resp.status === false) {
          res.status(500).send("Something went wrong !!");
        }

        res.cookie("wlUser", searchUser._id, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, //1 hrs
          sameSite: "none",
          secure: true,
        });
        return res.status(200).send({
          success: true,
          message: `OTP Sended successfully on ${phone_number} !!`,
        });
      }
    }

    const getUserId = uuidv4();
    const createdUser = await Users_Schema.create({
      user_id: getUserId,
      username,
      phone_number,
      joining_date: new Date().toUTCString(),
    });

    //await Utils.sendPhoneOTP(phone_number);
    console.log("register" + phone_number);
    const resp = await otp_service.sendOtpToNumber(Number(phone_number));

    if (resp.status === false) {
      res.status(500).send("Something went wrong !!");
    }

    res.cookie("wlUser", createdUser._id, {
      // httpOnly: true,
      // // maxAge: 3000000, //5 Min
      // maxAge: 24 * 60 * 60 * 1000, //5 Min
      // sameSite: "none",
      // secure: true,
      // crossDomain: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //1 hrs
      sameSite: "none",
      secure: true,
    });
    res.status(200).send({
      success: true,
      message: `OTP Sended successfully on ${phone_number} !!`,
    });
    console.log(username);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const registerVerify = async (req, res) => {
  try {
    const { wlUser } = req.cookies;
    const { otp } = req.body;
    const { phone_number } = req.body;

    if (!wlUser) {
      return res.send("OTP Expire !!");
    }
    if (!otp) {
      return res.send("fill the OTP !!");
    }

    let user = await Users_Schema.findById(wlUser);

    //const isVerify = await Utils.verifyOTPNumber(user.phone_number, otp);

    const isVerify = true;

    if (!isVerify) {
      return res.send({
        success: false,
        message: "Invalid OTP !!",
      });
    }

    const resp = await otp_service.verifyOtpForUser(phone_number, otp);

    if (resp.status === false) {
      return res.status(203).send({
        success: false,
        message: "Invalid Otp !!!",
      });
    }

    user.veifyedUser = true;
    user.save();

    const token = await Utils.create_Jwt(
      { id: user._id, user_type: user.user_type },
      process.env.JWT_TOKEN_SECRET
    );
    res.cookie("wlUser", null, {
      httpOnly: true,
      maxAge: 0,
      sameSite: "none",
      secure: true,
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), //5 hrs
      sameSite: "none",
      secure: true,
    });
    return res.status(200).send({
      success: true,
      message: "Logged in Success !!",
      verified: true,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

// Login user with email or phone number
const loginUser = async (req, res) => {
  const { email, phone_number, password } = req.body;
  try {
    let findUserPhone;
    const findUserEmail = await Users_Schema.findOne({ email: email });
    if (!findUserEmail) {
      findUserPhone = await Users_Schema.findOne({
        phone_number: phone_number,
      });
      if (!findUserPhone) {
        return res.send("Invalid Username or password !!");
      }
    }

    let isValidPassword = false;
    if (findUserEmail) {
      try {
        isValidPassword = await Utils.compare_Password(
          password,
          findUserEmail.password
        );
      } catch (err) {
        console.log(err);
        res.send("Something went wrong !!");
      }
      if (!isValidPassword) {
        return res.send("Invalid Username or password !!");
      }
      if (isValidPassword) {
        const token = await Utils.create_Jwt(
          { id: findUserEmail._id, user_type: findUserEmail.user_type },
          process.env.JWT_TOKEN_SECRET
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, //5 hrs
          sameSite: "none",
          secure: true,
        });
        return res.status(200).send("Logged in Success !!");
      }
    }
    if (findUserPhone) {
      try {
        isValidPassword = await Utils.compare_Password(
          password,
          findUserPhone.password
        );
      } catch (err) {
        console.log(err);
        res.send("Something went wrong !!");
      }
      if (!isValidPassword) {
        return res.send("Invalid Username or password !!");
      }
      if (isValidPassword) {
        const token = await Utils.create_Jwt(
          { id: findUserPhone._id, user_type: findUserPhone.user_type },
          process.env.JWT_TOKEN_SECRET
        );
        res.cookie("jwt", token, {
          maxAge: 24 * 60 * 60 * 1000, //5 hrs
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        return res.status(200).send("Logged in Success !!");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const loginUserByNumber = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.send("Please Enter a Phone number !!");
    }
    if (phone_number.length < 10) {
      return res.send("Phone number can't be less then 10 digit !!");
    }
    const user = await Users_Schema.findOne({
      phone_number: Number(phone_number.replace("+", "")),
    });

    if (!user) {
      return res.send({
        success: false,
        message: "User Not Found !!",
      });
    }

    // console.log(user);
    // console.log(phone_number.replace("+", ""), user.phone_number);

    if (user.veifyedUser === false) {
      return res.send({
        success: false,
        message: "Pls Register And Try Again !!!",
      });
    }

    // let createOTP = Math.floor(Math.random() * 1000000);

    // user.otp = createOTP;
    // user.save();

    // console.log(createOTP);

    //const response = await Utils.sendPhoneOTP(Number(phone_number));
    // console.log("Response =>",respons);
    const resp = await otp_service.sendOtpToNumber(Number(phone_number));

    if (resp.status === false) {
      res.status(500).send("Something went wrong !!");
    }

    res.status(200).cookie("wlUser", user._id, {
      httpOnly: true,
      // maxAge: 3000000, //5 Min
      maxAge: 24 * 60 * 60 * 1000, //5 Min
      sameSite: "none",
      secure: true,
      crossDomain: true,
    });

    res.send({
      success: true,
      message: `OTP Sended Successful on ${phone_number} Please Login`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const verifyOTPRegLog = async (req, res) => {
  try {
    const { otp } = req.body;
    const { phone_number } = req.body;
    const { wlUser } = req.cookies;

    if (!wlUser) {
      return res.send("Please UserID !!!");
    }
    if (!otp) {
      return res.send("Please proide OTP !!!");
    }

    const findUser = await Users_Schema.findById(wlUser);

    if (!findUser) {
      return res.send("User Not Found !!!");
    }

    // findUser.otp = null;
    // findUser.save();

    // const isVerifyNumber = await Utils.verifyOTPNumber(
    //   findUser.phone_number,
    //   otp
    // );

   const resp = await otp_service.verifyOtpForUser(phone_number, otp);

    const isVerifyNumber = true;

    console.log("Check Verified => ", isVerifyNumber);

    if (resp.status === false) {
      return res.status(203).send({
        success: false,
        message: "Invalid Otp !!!",
      });
    }

    const token = await Utils.create_Jwt(
      { id: findUser._id, user_type: findUser.user_type },
      process.env.JWT_TOKEN_SECRET
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 10 * 10, 
      sameSite: "none",
      secure: true,
    });

    res.status(200).cookie("wlUser", null, {
      httpOnly: true,
      maxAge: 0, //5 Min
      sameSite: "none",
      secure: true,
    });
    const user = findUser;
    res.send({ user, success: true });

    // const token = await Utils.create_Jwt(
    //   { id: user._id, user_type: user.user_id },
    //   process.env.JWT_TOKEN_SECRET
    // );
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const fetchLoginUserData = async (req, res) => {
  try {
    const { jwt } = req.cookies;
    console.log(req.cookies);
    if (!jwt) {
      return res.status(500).send({ message: "Session expired"});
    }

    const _id = await Utils.verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);
    console.log(_id);

    const user = await Users_Schema.findById(_id.id);

    res.json({ success: true, user: user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// logout user
const logoutUser = async (req, res) => {
  try {
    console.log(req.cookies);
    res.cookie("jwt", "", {
      httpOnly: true,
      maxAge: 0, //5 hrs
      sameSite: "none",
      secure: true,
    });
    return res.status(200).send({
      success: true,
      message: "Log out Success !!",
    });
  } catch (error) {
    console.log(error);
  }
};

//getting all users
const getAllUser = async (req, res) => {
  try {
    const getAllUserCount = await Users_Schema.find({}).count();
    const alluser = await Users_Schema.find({}).sort({ createdAt: -1 });
    res.status(200).json({ alluser: alluser, user_count: getAllUserCount });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const makePaymentAddRewards = async (req, res) => {
  try {
    const { productId, reword } = req.body;
    const products = productId;

    const { jwt } = req.cookies;

    if (!jwt) {
      return res.send("Please Login And Try Again");
    }

    const _id = await Utils.verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);

    const user = await Users_Schema.findById(_id.id);

    if (!user) {
      return res.send("User Not Found");
    }

    let prodId = [];
    products.map((ele) => {
      prodId.push(ele?.data?._id);
    });

    const allProduct = await Products_Schema.find({ _id: prodId });

    let arrProPrice = [];

    for (let i = 0; i < products.length; i++) {
      arrProPrice.push(
        allProduct[i]?.product_sale_price * products[i].changeQut
      );
    }

    let totalPrice = 0;
    arrProPrice.forEach((element) => {
      console.log(element);
      totalPrice += Number(element);
    });
    console.log("totalPrice", totalPrice);

    // Payment Integreation Start
    const options = {
      amount: (totalPrice - reword) * 100,
      currency: "INR",
      receipt: "",
    };

    const order = await instance.orders.create(options);

    // console.log("order => ", order);

    // Payment Integreation End

    // let totatRewards = 0;
    // allProduct.map((ele) => {
    //   // console.log(ele);
    //   totatRewards += ele.product_reword_point;
    // });
    // user.rewords_points += totatRewards;
    // user.save();

    res.send({
      success: true,
      product: allProduct,
      totalPrice,
      user,
      order,
    });
  } catch (err) {
    console.log("Error from payment", err);
    res.status(500).send({ message: "Something went wrong !!" });
  }
};

// const verifyPaymentRezor = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       cartData,
//       email,
//       address,
//       total_amount,
//       reword,
//     } = req.body;
//     const { jwt } = req.cookies;
//     if (!jwt) {
//       return res.send("Please Login And Try Again");
//     }

//     const _id = await Utils.verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);

//     const user = await Users_Schema.findById(_id.id);

//     if (!user) {
//       return res.send("User Not Found");
//     }

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(404).send("Data Missing !!");
//     }

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSign = await crypto
//       .createHmac("sha256", process.env.KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     // console.log(expectedSign, razorpay_signature);

//     if (expectedSign !== razorpay_signature) {
//       return res.status(404).send("Unauth !!");
//     }

//     // if (reword > total_amount) {
//     //   const rew = total_amount - reword;
//     //   user.rewords_points = Math.abs(Number(rew));
//     //   user.save();
//     // } else {
//     user.rewords_points = user.rewords_points - reword;
//     user.save();
//     // }

//     if (expectedSign === razorpay_signature) {
//       let prodId = [];
//       cartData.map((ele) => {
//         // console.log(ele);
//         prodId.push(ele?.data?._id);
//       });

//       // console.log(prodId);

//       const allProduct = await Products_Schema.find({ _id: prodId });
//       // console.log(allProduct);

//       let totatRewards = 0;
//       allProduct.map((ele) => {
//         // console.log(ele);
//         totatRewards += ele.product_reword_point;
//       });

//       const user_main = await Users_Schema.findById(_id.id);

//       console.log("Rewords", totatRewards, user_main.rewords_points);

//       user_main.rewords_points += totatRewards;
//       // user_main.rewords_points += 1000;
//       user_main.save();
//       // const order_id = uuidv4();
//       // console.log(getUserId);

//       // const orderData = {
//       //   order_id: `ORD_${order_id}`,
//       //   customer_id: user.user_id,
//       //   customer_name: user.username,
//       //   customer_phone_number: user.phone_number,
//       //   products: allProduct,
//       //   shipping_address: "",
//       //   state: "",
//       //   pincode: "",
//       // };

//       // console.log(user);
//       // const order = await Order_Schema.find();

//       const getOrderId = "order-" + generateOrderId.generate();
//       // console.log(getOrderId);
//       const create = new Orders_Schema({
//         order_id: getOrderId,
//         customer_phone_number: user?.phone_number,
//         customer_id: user?.user_id,
//         customer_name: user.username,
//         customer_email: email,
//         order_status: "pending",
//         products: cartData,
//         shipping_address: address,
//         razorpay_payment_id: razorpay_payment_id,
//         total_amount: total_amount,
//         paymentType: "online",
//         // state: req.body?.state,
//         // pincode: req.body?.pincode,
//         // customer_gst: req.body?.customer_gst,
//         // customer_business: req.body?.customer_business,
//       });
//       const result = await create.save();

//       console.log("reword", reword);

//       return res.status(200).json({
//         success: true,
//         message: "Your Transition is successful",
//         pay_id: razorpay_payment_id,
//       });
//     } else {
//       res.status(400).send({
//         success: false,
//         message: "Transition is Failed. Please Try Again !!",
//       });
//     }

//     return res.send({ success: true, message: "body" });
//   } catch (err) {
//     console.log("Error =>", err);
//     res.status(500).send("Something went wrong !!");
//   }
// };
// const verifyPaymentRezorByRewords = async (req, res) => {
//   try {
//     const { cartData, email, address, total_amount, reword } = req.body;
//     const { jwt } = req.cookies;
//     if (!jwt) {
//       return res.send("Please Login And Try Again");
//     }

//     const _id = await Utils.verifying_Jwt(jwt, process.env.JWT_TOKEN_SECRET);

//     const user = await Users_Schema.findById(_id.id);

//     if (!user) {
//       return res.send("User Not Found");
//     }

//     const rew = total_amount - reword;
//     user.rewords_points = Math.abs(Number(rew));
//     user.save();

//     let prodId = [];
//     cartData.map((ele) => {
//       // console.log(ele);
//       prodId.push(ele?.data?._id);
//     });

//     // console.log(prodId);

//     const allProduct = await Products_Schema.find({ _id: prodId });
//     // console.log(allProduct);

//     let totatRewards = 0;
//     allProduct.map((ele) => {
//       // console.log(ele);
//       totatRewards += ele.product_reword_point;
//     });

//     const user_main = await Users_Schema.findById(_id.id);

//     console.log("Rewords", totatRewards, user_main.rewords_points);

//     user_main.rewords_points += totatRewards;
//     // user_main.rewords_points += 100;
//     user_main.save();
//     // const order_id = uuidv4();
//     // console.log(getUserId);

//     // const orderData = {
//     //   order_id: `ORD_${order_id}`,
//     //   customer_id: user.user_id,
//     //   customer_name: user.username,
//     //   customer_phone_number: user.phone_number,
//     //   products: allProduct,
//     //   shipping_address: "",
//     //   state: "",
//     //   pincode: "",
//     // };

//     // console.log(user);
//     // const order = await Order_Schema.find();

//     const getOrderId = "order-" + generateOrderId.generate();
//     // console.log(getOrderId);
//     const create = new Orders_Schema({
//       order_id: getOrderId,
//       customer_phone_number: user?.phone_number,
//       customer_id: user?.user_id,
//       customer_name: user.username,
//       customer_email: email,
//       order_status: "pending",
//       products: cartData,
//       shipping_address: address,
//       razorpay_payment_id: "-",
//       total_amount: total_amount,
//       paymentType: "by_reword",
//       // state: req.body?.state,
//       // pincode: req.body?.pincode,
//       // customer_gst: req.body?.customer_gst,
//       // customer_business: req.body?.customer_business,
//     });
//     const result = await create.save();

//     console.log("reword", reword);

//     return res.status(200).json({
//       success: true,
//       message: "Your Transition is successful",
//       pay_id: "-",
//     });
//   } catch (err) {
//     console.log("Error =>", err);
//     res.status(500).send("Something went wrong !!");
//   }
// };

// get user by id (who's logged in)
const getUserById = async (req, res) => {
  const cookie = req.cookies["jwt"];
  try {
    if (!cookie) {
      return res.send("Unauthenticated !!");
    }
    const verifyJwt = await Utils.verifying_Jwt(
      cookie,
      process.env.JWT_TOKEN_SECRET
    );
    if (!verifyJwt) {
      return res.send("Unauthenticated !!");
    }
    const findUser = await Users_Schema.findById(verifyJwt.id, "-password");
    if (!findUser) {
      return res.send("Unauthenticated !!");
    }
    res.status(200).send(findUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// get user by id
const getUser = async (req, res) => {
  const userId = req.params.user_id;
  try {
    if (!userId)
      return res
        .status(404)
        .send({ status: false, message: "user not found !!" });
    const findUser = await Users_Schema.findById(userId);
    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "user not found !!" });
    res.status(200).send(findUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("something went wrong !!");
  }
};

// edit users by id
const editUserByID = async (req, res) => {
  const userId = req.params.user_id;
  try {
    if (!userId) {
      return res.send("please provide a user id");
    }
    if (req.body.password) {
      const hashedNewPassword = await Utils.Hashing_Password(req.body.password);
      const find = await Users_Schema.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
      });
      if (!find) {
        return res.send("User not found");
      }
      return res.status(200).send("Password Updated success");
    }
    const findUser = await Users_Schema.findByIdAndUpdate(userId, {
      $set: req.body,
    });
    if (!findUser) {
      return res.send("user not found");
    }
    res.status(200).send("user updated successfully !!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// search in users
const searchInUsers = async (req, res) => {
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  // console.log("SEARCH===",searchValue)
  try {
    // result = await Users_Schema.find({user_id:{$regex:searchRegex}})

    // if(!result.length > 0){
    result = await Users_Schema.find({
      username: { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await Users_Schema.find({ email: { $regex: searchRegex } }).sort(
        { createdAt: -1 }
      );
    }
    // }
    const numberField = parseInt(searchValue);
    // console.log(numberField)
    if (numberField) {
      // console.log(numberField)
      result = await Users_Schema.find({
        phone_number: numberField,
      }).sort({ createdAt: -1 });
      return res.status(200).send(result);
    }

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

// API FOR  FILTER IS USERS
const filterForUsers = async (req, res) => {
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

    // filter users by todays date and by their status
    let user_status;
    if (date_from && date_to && by_status) {
      if (by_status != "all") {
        user_status = by_status == "verified" ? true : false;
        result = await Users_Schema.aggregate([
          {
            $match: {
              verified: user_status,
              createdAt: {
                $lte: Utils.convertDate(increaseEndDateByOne),
                $gte: Utils.convertDate(date_from),
              },
            },
          },
          { $project: { password: 0 } },
        ]).sort({ createdAt: -1 });
        return res.status(200).send(result);
      }
    } else {
      result = await Users_Schema.find(
        { verified: user_status },
        "-password"
      ).sort({ createdAt: -1 });
      // return res.status(200).send(result)
    }

    if (date_from && date_to) {
      result = await Users_Schema.aggregate([
        {
          $match: {
            createdAt: {
              $lte: Utils.convertDate(increaseEndDateByOne),
              $gte: Utils.convertDate(date_from),
            },
          },
        },
        { $project: { password: 0 } },
      ]).sort({ createdAt: -1 });
      console.log("RESULT NEW----", result);
      return res.status(200).send(result);
    }
    if (by_status != "all") {
      let user_status = by_status === "verified" ? true : false;
      result = await Users_Schema.find(
        { verified: user_status },
        "-password"
      ).sort({ createdAt: -1 });
      return res.status(200).send(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

// delete Users
const deleteUsers = async (req, res) => {
  // console.log("body=>",req.body)
  // console.log("body=>",req.body?.length)
  try {
    if (req.body?.length) {
      const deleteSelected = await Users_Schema.deleteMany({
        _id: {
          $in: req.body,
        },
      });
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "image not deleted", status: false });
      }
      return res
        .status(200)
        .send({ message: "image delete success", status: true });
    }
    res.status(200).send({ message: "image not deleted", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "image not deleted", status: false });
  }
};
const deleteUsersById = async (req, res) => {
  // console.log("body=>",req.body)
  // console.log("body=>",req.body?.length)
  try {
    if (req.body?._id) {
      const deleteSelected = await Users_Schema.findByIdAndDelete(req.body._id);
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "image not deleted", status: false });
      }
      return res
        .status(200)
        .send({ message: "image delete success", status: true });
    }
    res.status(200).send({ message: "image not deleted", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "image not deleted", status: false });
  }
};

exports.loginUserByNumber = loginUserByNumber;
exports.registerUser = registerUser;
exports.getAllUser = getAllUser;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.editUserByID = editUserByID;
exports.searchInUsers = searchInUsers;
exports.filterForUsers = filterForUsers;
exports.deleteUsers = deleteUsers;
exports.getUser = getUser;
exports.verifyOTPRegLog = verifyOTPRegLog;
exports.registerVerify = registerVerify;
exports.fetchLoginUserData = fetchLoginUserData;
// exports.makePaymentAddRewards = makePaymentAddRewards;
// exports.verifyPaymentRezor = verifyPaymentRezor;
// exports.verifyPaymentRezorByRewords = verifyPaymentRezorByRewords;
exports.deleteUsersById = deleteUsersById;
