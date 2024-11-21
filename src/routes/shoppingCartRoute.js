const express = require('express');
const router = express.Router();
const ShoppingCartController = require('../controllers/shoppingCartController');
const { isShop, isAuth } = require("../middlewares/auth");


// router.use(authService.protect, authService.allowedTo('user'));
// router
//   .route('/')
//   .post(isAuth, ShoppingCartController.addProductToCart)
//   .get(isAuth, ShoppingCartController.getLoggedUserCart)
//   .delete(isAuth, ShoppingCartController.clearCart);

router.get("/", isAuth, ShoppingCartController.getLoggedUserCart);
router.post("/add", isAuth, ShoppingCartController.addProductToCart);
router.delete("/", isAuth, ShoppingCartController.clearCart);
router.put("/:itemId", isAuth, ShoppingCartController.updateCartItemQuantity);
router.delete("/:itemId", isAuth, ShoppingCartController.removeSpecificCartItem);

// router.put('/applyCoupon', applyCoupon);

// router
//   .route('/:itemId')
//   .put(ShoppingCartController.updateCartItemQuantity)
//   .delete(ShoppingCartController.removeSpecificCartItem);

module.exports = router;