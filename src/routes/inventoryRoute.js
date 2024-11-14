const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");


router.post("/", inventoryController.createInventory);

module.exports = router;