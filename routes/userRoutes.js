const express = require("express");
const router = express.Router();

const { createAdmin ,login} = require("../controller/user");

router.post("/create-admin", createAdmin);
router.post("/login", login);

// router.post("/create-user", createUser);
// router.post("/otp-for-passwordreset", sendOtpForPasswordReset);
// router.put("/verify-and-resetpassword", verifyOtpAndUpdatePassword);
// router.put("/change-password", protectUser, changePassword);
// router.get("/get-myProfile", protectUser, getMyProfile);

module.exports = router;
