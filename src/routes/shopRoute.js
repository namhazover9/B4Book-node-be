const express = require('express');
const router = express.Router();
const shop = require("../controllers/shopController");
router.get("/filter", shop.filterShop);
router.get("/search", shop.searchShop);
module.exports = router;
