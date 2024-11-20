const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isShop, isAuth } = require("../middlewares/auth");


// router.use(authService.protect, authService.allowedTo('user'));
// router
//   .route('/')
//   .post(isAuth, ShoppingCartController.addProductToCart)
//   .get(isAuth, ShoppingCartController.getLoggedUserCart)
//   .delete(isAuth, ShoppingCartController.clearCart);

router.get("/summary", isAuth, OrderController.getCartForOrder);
router.post("/summary", isAuth, OrderController.createOrder);

module.exports = router;