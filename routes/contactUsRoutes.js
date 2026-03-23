const express = require("express");
const router = express.Router();
const { protectUser } = require('../middleware/authUser');

const { createContactUs, getAllContactUs, deleteContactUs } = require("../controller/contactUs");

router.post("/create-contactus", createContactUs);
router.get("/get-allcontactus", protectUser, getAllContactUs);
router.delete("/delete-contactus", protectUser, deleteContactUs);


module.exports = router;
