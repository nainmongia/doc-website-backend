const mongoose = require("mongoose")
const Mobilebanners_Schema = new mongoose.Schema(
    {
        image_name:{type:String},
        image_url:{type:String},
        path:{type:String},

    },{timestamps:true}
)

module.exports = mongoose.model("Mobilebanners",Mobilebanners_Schema)