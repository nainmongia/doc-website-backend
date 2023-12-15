const mongoose = require("mongoose");

const doctorenquirySchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    doctorCode: {
      type: String,
      required: true,
    },
    languages: {
      type: String,
    },
    doctorName: {
      type: String,
      required: true,
    },
    consultationType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorEnquiry", doctorenquirySchema);
