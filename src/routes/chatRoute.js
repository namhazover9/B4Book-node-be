const express = require('express');
const router = express.Router();
const { isAuth } = require("../middlewares/auth");
const chatController = require("../controllers/chatController")

router.post("/createChat/:id", isAuth, chatController.createChat);
router.put("/updateChat/:id/:userId", isAuth, chatController.updateChat);
router.delete("/deleteChat/:id/:userId", isAuth, chatController.deleteChat);
router.get("/getAllChatById/:id", isAuth, chatController.getAllChatById);
router.get("/getChatById/:id", isAuth, chatController.getChatById);
module.exports = router;