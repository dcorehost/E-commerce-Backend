const express = require("express");
const router = express.Router();
const { protectUser } = require('../middleware/authUser');
const { createAdmin ,login ,createUser ,sendOtpForPasswordReset, verifyOtpAndUpdatePassword, changePassword} = require("../controller/user");

router.post("/create-admin", createAdmin);
router.post("/login", login);
router.post("/create-user", createUser);
router.post("/otp-for-passwordreset", sendOtpForPasswordReset);
router.put("/verify-and-resetpassword", verifyOtpAndUpdatePassword);
router.put("/change-password", protectUser, changePassword);

module.exports = router;
