const express = require('express');
const router = express.Router();
const { isAuth } = require("../middlewares/auth");
const chatController = require("../controllers/chatController")

router.post("/createChat/:id", isAuth, chatController.createChat);
router.put("/updateChat/:id/:userId", isAuth, chatController.updateChat);
router.delete("/deleteChat/:id/:userId", isAuth, chatController.deleteChat);
router.get("/getAllChatById/:id", isAuth, chatController.getAllChatById);
module.exports = router;