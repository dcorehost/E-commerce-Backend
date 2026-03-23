const express = require("express");
const router = express.Router();
const { protectUser } = require('../middleware/authUser');
const upload = require("../middleware/upload");
const { createCategory ,getCategories ,updateCategory ,deleteCategory} = require("../controller/categories");

router.post("/create-category",protectUser,upload.single("image"), createCategory);
router.get("/get-categories", getCategories);
router.put("/update-category",protectUser,upload.single("image"), updateCategory);
router.delete("/delete-category",protectUser, deleteCategory);

module.exports = router;
