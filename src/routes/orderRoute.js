const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isShop, isAuth } = require("../middlewares/auth");


router.get("/by-status", isAuth, OrderController.getAllOrdersByStatus);
router.get("/getAllOrderByShop/:id", isShop, OrderController.getAllOrderByShop);
router.get('/cart-data', isAuth, OrderController.getCartForOrder);
router.get("/search",isShop, OrderController.searchOrder);
router.get("/vnpay-return", OrderController.vnpayReturn);
router.get("/customer/:id", isAuth, OrderController.getCustomerOrders);
router.get("/:orderId", isAuth, OrderController.getOrderById);

// router.post("/summary", isAuth, OrderController.createOrder);
// router.post("/create_payment_url", OrderController.createVNpay);
// router.post('/stripe/webhook', isAuth, express.raw({ type: 'application/json' }), OrderController.stripeWebhook)

router.post('/place-order-vn',  OrderController.createVNpay);

router.patch("/:orderId/confirmed", OrderController.orderConfirmedStatus);
router.patch("/:orderId/shipped", OrderController.orderShippedStatus);
router.patch("/:orderId/delivered", OrderController.orderDeliveredStatus);
router.patch("/:orderId/cancelled", OrderController.orderCancelledStatus);

module.exports = router;