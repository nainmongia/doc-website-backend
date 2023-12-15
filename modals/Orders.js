const mongoose = require("mongoose");
const Order_Schema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    tid: {
      type: String
    },
    paymentType: {
      type: String,
      default: "-"
    },
    total_amount: {
      type: String,
      required: true,
      default: "-",
    },
    razorpay_payment_id: {
      type: String,
      // required: true,
      default: "-",
    },
    customer_id: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone_number: {
      type: Number,
      required: true,
    },
    customer_email: {
      type: String,
    },
    customer_business: {
      type: String,
    },
    customer_gst: {
      type: String,
    },
    transport_detail: {
      type: String,
    },
    // payment_id:{
    //     type:String,
    // },
    order_status: {
      type: String,
      required: true,
      default: "pending",
    },
    ordered_products_transport_detail: {
      type: String,
    },
    products: [
      {
        product_id : { type: String },
        product_code : { type: String },
        product_name: { type: String },
        product_main_category: { type: String },
        product_category: { type: String },
        product_subcategory: { type: String },
        product_variant: { type: String },
        price: {type:Number},
        product_quantity: { type: Number },
        product_reword_point: { type: String },
        product_delivery_status: { type: Boolean },
        product_images: [
          {
            image_name: { type: String },
            image_url: { type: String },
            path: { type: String },
          },
        ],
        images: [
          {
            image_name: { type: String },
            image_url: { type: String },
            path: { type: String },
            _id: { type: String },
          },
        ],
        productID: {
          type: String
        },
        id: {
          type: String
        },
        category: {
          type: String
        },
        name: {
          type: String
        },
        rate: {
          type: Number
        },
        price: {
          type: Number
        },
        new: {
          type: Boolean
        },
        brand: String,
        code: {
          type: String
        },
        cartQuantity: {
          type: Number
        },
      },
    ],
    shipping_address: { type: String },
    state: { type: String },
    pincode: { type: Number,
      required:true
     },
    // shipping_address:{
    //         pincode: { type: Number,required:true },
    //         state: { type: String,required:true },
    //         city: { type: String,required:true },
    //         street: { type: String,required:true },
    //         landmark: { type: String,required:true },
    //         houseNo: { type: String,required:true },
    //         mobileNo: { type: Number,required:true },
    //       },
    // payment_mode:{
    //     type:String,
    //     required:true
    // }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Orders", Order_Schema);
