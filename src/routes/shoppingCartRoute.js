const express = require('express');
const router = express.Router();
const ShoppingCartController = require('../controllers/shoppingCartController');
const { isShop, isAuth } = require("../middlewares/auth");


// router.use(authService.protect, authService.allowedTo('user'));
router
  .route('/')
  .post(isAuth, ShoppingCartController.addProductToCart)
  .get(isAuth, ShoppingCartController.getLoggedUserCart)
  .delete(isAuth, ShoppingCartController.clearCart);

// router.put('/applyCoupon', applyCoupon);

router
  .route('/:itemId')
  .put(ShoppingCartController.updateCartItemQuantity)
  .delete(ShoppingCartController.removeSpecificCartItem);

module.exports = router;