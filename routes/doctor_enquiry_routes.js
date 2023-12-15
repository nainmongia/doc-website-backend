const express = require("express");
const router = express.Router();
const equ = require("../controllers/DoctorEnquiry_Controller");

router.post('/doctorEnquiry', equ.addDoctorEnquiry);
router.get("/doctorsEnquires/", equ.getDoctorEnquiries);
router.get("/search/doctorsEnquiry/", equ.searchDoctorEnquiry);
router.delete("/deleteDoctorEqu" , equ.deleteEnquiries);

module.exports = router;