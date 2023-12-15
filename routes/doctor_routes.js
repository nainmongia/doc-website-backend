const express = require("express");
const router = express.Router();
const { addDoctors,getDoctors,updateDoctor, getDoctorById,searchDoctors,deleteDoctors } = require("../controllers/Doctors_Controller");

router.post('/create/new/doctor', addDoctors);
router.get("/get/all/doctors/", getDoctors);
router.get("/get/doctor/:id", getDoctorById);
router.patch("/update/doctor/:id", updateDoctor);
router.get("/search/in/doctors", searchDoctors);
router.delete("/delete/doctors", deleteDoctors);

module.exports = router;