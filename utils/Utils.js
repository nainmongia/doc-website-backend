const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const msg91 = require("msg91").default;
// msg91.initialize({ authKey: process.env.MSG_AUTH_KEY });

// All global function

// signing JWT
function create_Jwt(payload, key) {
  const token = jwt.sign(payload, key);
  return token;
}

// verifing JWT
function verifying_Jwt(token, key) {
  const verify_token = jwt.verify(token, key);
  return verify_token;
}

// Creating hash password
function Hashing_Password(password) {
  const createHash = bcrypt.hash(password, 12);
  return createHash;
}

//comparing hashed password
function compare_Password(password, hashedPassword) {
  const checkPassword = bcrypt.compare(password, hashedPassword);
  return checkPassword;
}

// creating regex
function createRegex(value) {
  // Escape special characters in the search value
  
  const escapedValue = value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Create a case-insensitive regex with optional spaces/periods
  return new RegExp(escapedValue.split(/\s*\.\s*/).join('.*'), 'i');
}

// get previous date
function getDateXDaysAgo(numOfDays, date = new Date()) {
  const daysAgo = new Date(date.getTime());

  daysAgo.setDate(date.getDate() - numOfDays);

  return daysAgo;
}

// send message otp
async function sendPhoneOTP(phNumber) {
  try {
    // let sms = msg91.getSMS();
    let otp = await msg91.getOTP(process.env.TEMP_ID_MSG);

    const sendedOtp = await otp.send(phNumber);

    return sendedOtp;
  } catch (error) {
    console.log(error);
  }
}

// send message otp
async function verifyOTPNumber(phNumber, otpH) {
  try {
    // await msg91.initialize({ authKey: process.env.MSG_AUTH_KEY });
    // let sms = msg91.getSMS();
    let otp = await msg91.getOTP(process.env.TEMP_ID_MSG);

    console.log("Data => ",phNumber, otpH);

    const isVerify = await otp.verify(phNumber, otpH);
    // console.log(isVerify);
    return isVerify;
  } catch (error) {
    console.log(error);
  }
}

// CONVERT DATE
function convertDate(date) {
  let currentDate = new Date(date).toJSON().slice(0, 10);
  console.log(currentDate); // "2022-06-17"
  const customDate = new Date(currentDate);
  // console.log("Custom Date",customDate)
  return customDate;
}

module.exports = {
  convertDate,
  create_Jwt,
  verifying_Jwt,
  getDateXDaysAgo,
  Hashing_Password,
  compare_Password,
  createRegex,
  sendPhoneOTP,
  verifyOTPNumber,
};


