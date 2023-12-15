const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const paymentAmount = async (res, amount) => {
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "",
    };

    const order = await instance.orders.create(options);
    console.log("order => ", order);
    
  } catch (err) {
    return res.send("Internal Server Error !!");
  }
};
const verifyPayment = () => {};

exports.instance = instance;
exports.paymentAmount = paymentAmount;
