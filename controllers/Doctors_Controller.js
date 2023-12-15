const Doctor_Schema = require("../modals/Doctors");
const Utils = require("../utils/Utils");

const addDoctors = async (req, res) => {
  console.log(req.body);
  const newDoctor = new Doctor_Schema({
    doctor_id: req.body.doctor_id,
    name: req.body.name,
    experience: req.body.experience,
    Specialization: req.body.Specialization,
    price: req.body.price,
    languages: req.body.languages,
    image: req.body.image,
    description: req.body.description,
    time: req.body.time,
    availability: req.body.availability,
    appointments: req.body.appointments,
   });
  try {
    const savedDoctor = await newDoctor.save();
    res.status(200).json(savedDoctor);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong !!");
  }
};

const getDoctors = async (req, res) => {
  try {
    const allDoctors = await Doctor_Schema.find();
    res.status(200).json(allDoctors);
  } catch (error) {
    res.status(500).send("Something went wrong !!");
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor_Schema.findById(req.params.id);
    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).send("Something went wrong !!");
  }
};


const updateDoctor = async (req, res) => {
  try {
    const Doctor = await Doctor_Schema.findById(req.params.id);
    if (!Doctor) return res.status(404).send("Doctor not found");
    const updatedDoctor = await Doctor_Schema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).send("Something went wrong !!");
  }
};

// SEARCH IN DOCTORS
const searchDoctors = async (req, res) => {
  const searchValue = req.query.search;
  const searchRegex = Utils.createRegex(searchValue);
  let result;
  try {
    result = await Doctor_Schema.find({
      doctor_id : { $regex: searchRegex },
    }).sort({ createdAt: -1 });
    if (!result.length > 0) {
      result = await Doctor_Schema.find({
        name: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    if (!result.length > 0) {
      result = await Doctor_Schema.find({
        Specialization: { $regex: searchRegex },
      }).sort({ createdAt: -1 });
    }
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong !!");
  }
};

const deleteDoctors = async (req, res) => {
  // console.log("body=>",req.body)
  // console.log("body=>",req.body?.length)
  try {
    if (req.body?.length) {
      const deleteSelected = await Doctor_Schema.deleteMany({
        _id: {
          $in: req.body,
        },
      });
      if (!deleteSelected) {
        return res
          .status(200)
          .send({ message: "Doctor delete failed", status: false });
      }
      return res
        .status(200)
        .send({ message: "Doctor delete success", status: true });
    }

    res.status(200).send({ message: "Doctor delete failed", status: false });
  } catch (err) {
    console.log(err);
    res.status(200).send({ message: "Doctor delete failed", status: false });
  }
};

exports.searchDoctors = searchDoctors;
exports.addDoctors = addDoctors;
exports.getDoctors = getDoctors;
exports.updateDoctor = updateDoctor;
exports.getDoctorById = getDoctorById;
exports.deleteDoctors = deleteDoctors;

