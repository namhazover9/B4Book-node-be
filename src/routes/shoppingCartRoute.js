const express = require('express');
const router = express.Router();
const ShoppingCartController = require('../controllers/shoppingCartController');

// router.use(authService.protect, authService.allowedTo('user'));
router
  .route('/')
  .post(ShoppingCartController.addProductToCart)
  .get(ShoppingCartController.getLoggedUserCart)
  .delete(ShoppingCartController.clearCart);

// router.put('/applyCoupon', applyCoupon);

router
  .route('/:itemId')
  .put(ShoppingCartController.updateCartItemQuantity)
  .delete(ShoppingCartController.removeSpecificCartItem);

module.exports = router;