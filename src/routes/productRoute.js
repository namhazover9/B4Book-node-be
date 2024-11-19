const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { isShop, isAuth } = require("../middlewares/auth");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/create", isShop, productController.createProduct);
router.put("/:id", isShop, productController.updateProduct);
router.delete("/:id", isShop, productController.deleteProduct);

module.exports = router;
