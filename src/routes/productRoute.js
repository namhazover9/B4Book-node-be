const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { isShop, isAuth } = require("../middlewares/auth");
const upload = require("../utils/multer");

router.post("/upload",  upload.array("images", 10), isShop, productController.uploadImages);
router.get("/search", productController.searchProduct);
router.get("/", productController.getAllProducts);
router.get("/exportFile", isShop, productController.exportFileProduct);
router.post("/create", upload.array("images", 10), isShop, productController.createProduct);
router.put("/:id", upload.array("images", 10), isShop, productController.updateProduct);
router.delete("/:id", isShop, productController.deleteProduct);
router.delete("/:id/remove-image", isShop, productController.removeImage);
router.get("/showRating/:id", productController.showRating);
router.put("/feedback/:id", isAuth, productController.feebackProduct);
router.put("/updateFeedbacks/:id", isAuth, productController.updateFeedbacks);
router.get("/showAllFeedbacks/:id", productController.showAllFeedbacks);
router.get("/:id", productController.getProductById);
router.get("/getProductByShop/:id", productController.getProductByShop);
router.delete("/deleteFeedback/:id/:feedbackId", productController.deleteFeedback);

module.exports = router;
