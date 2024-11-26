const express = require('express');
const router = express.Router();
const shop = require("../controllers/shopController");
const { isShop } = require('../middlewares/auth');

router.get("/search", shop.searchShop);
router.get("/filter", shop.filterShop);
router.post("/createVoucher",isShop, shop.createVoucher);
router.get("/getAllVoucher", shop.getAllVoucher);
router.put("/activeorDeactiveVoucher", shop.activeOrDeactiveVoucher);
router.put("/deleteVoucher/:id",isShop, shop.deleteVoucher);
router.put("/updateVoucher/:id",isShop, shop.updateVoucher);
router.get("/", shop.getAllShop);
router.get("/:id", shop.getValueVoucher);

module.exports = router;
