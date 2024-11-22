const express = require('express');
const router = express.Router();
const shop = require("../controllers/shopController");
const { isShop } = require('../middlewares/auth');

router.get("/filter", shop.filterShop);
router.post("/createVoucher",isShop, shop.createVoucher);
router.get("/getAllVoucher", shop.getAllVoucher);
router.get("/:id", shop.getValueVoucher);

module.exports = router;
