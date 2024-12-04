const express = require('express');
const router = express.Router();
const shop = require("../controllers/shopController");
const upload = require("../utils/multer");
const { isShop } = require('../middlewares/auth');

router.get("/search", shop.searchShop);
router.post("/createVoucher",isShop, shop.createVoucher);
router.post("/withdraws",isShop, shop.createWithdrawRequest);
router.get("/withdraws", isShop, shop.getWithdrawsByShopId);
router.get("/getAllVoucher", shop.getAllVoucher);
router.put("/activeorDeactiveVoucher", shop.activeOrDeactiveVoucher);
router.put("/deleteVoucher/:id",isShop, shop.deleteVoucher);
router.put("/updateVoucher/:id",isShop, shop.updateVoucher);
router.put("/updateShopInfo", upload.array("images", 1), isShop, shop.updateShopInfo);
router.get("/", shop.getAllShop);
router.get("/getAllVoucherForShop/:id", shop.getAllVoucherForShop);
router.get("/:id", shop.getValueVoucher);

module.exports = router;
