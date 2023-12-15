const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctor_id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  Specialization: {
    type: String,
    required: true,
  },
  image: {
    image_name : 
    {
      type: String
    },
    image_url : {
      type : String,
    },
    path : {
      type : String,
    }
  },
  description: {
    type: String,
    required: true,
  },
  languages: {
    type: String,
    default: ""
  },
  price: {
    call: {
      type: Number,
      required: true,
    },
    video: {
      type: Number,
      required: true,
    },
  },
  time: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  availability: {
    type: Boolean,
    default: true,
  },
  appointments: {
    type: Array,
    default: [],
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
