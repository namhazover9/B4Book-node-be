const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/auth");

router.get("/allWithdrawReqs", isAdmin, adminController.getAllWithdraws);
router.get("/withdrawReq/:id", isAdmin, adminController.getWithdrawById);
router.put("/withdrawReq/update", isAdmin, adminController.updateWithdrawRequest);
router.put("/activeorDeactive",isAdmin, adminController.activeOrDeactive);
router.get("/showAllRegisterForm",isAdmin, adminController.showAllRegisterForm);
router.put("/:id", isAdmin, adminController.approvedShop);
router.get("/showAllUser",isAdmin, adminController.showAllUser);

module.exports = router;
