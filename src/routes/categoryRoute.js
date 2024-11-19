const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isAdmin, isAuth } = require("../middlewares/auth");

router.get("/", categoryController.getAllCategories);
router.get("/:id", isAuth, categoryController.getCategoryById);
router.post("/createCategory", isAdmin, categoryController.createCategory);
router.put("/:id", isAdmin, categoryController.updateCategory);
router.delete("/:id", isAdmin, categoryController.deleteCategory);

module.exports = router;
