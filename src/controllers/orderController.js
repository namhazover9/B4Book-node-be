const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/shoppingCart');


exports.getCartForOrder = async (req, res) => {
  try {
    // Tìm giỏ hàng của người dùng hiện tại
    const cart = await Cart.findOne({ user: req.headers['id'] }).populate('cartItems.product');

    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Shopping cart is empty',
      });
    }

    // Gom nhóm các sản phẩm theo Shop
    const shopsMap = new Map();

    cart.cartItems.forEach((item) => {
      const product = item.product;
      const shopId = product.shopId.toString();

      if (!shopsMap.has(shopId)) {
        shopsMap.set(shopId, {
          shopId,
          orderItems: [],
        });
      }

      shopsMap.get(shopId).orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    });

    // Chuyển từ Map sang mảng để dễ sử dụng
    const shops = Array.from(shopsMap.values());

    res.status(200).json({
      status: 'success',
      message: 'Cart data retrieved successfully',
      data: {
        shops,
        shippingAddress: req.user.defaultShippingAddress || {}, // Nếu người dùng có địa chỉ mặc định
      },
    });
  } catch (error) {
    console.error('Error retrieving cart data:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving cart data',
      error: error.message,
    });
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { shops, shippingAddress, paymentMethod } = req.body;

    // Kiểm tra các trường dữ liệu đầu vào
    if (!shops || shops.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Shops cannot be empty',
      });
    }

    let totalOrderPrice = 0;

    const orderData = {
      customer: req.headers['id'], // ID của khách hàng hiện tại
      shops: [],
      shippingAddress,
      paymentMethod,
    };

    // Duyệt qua từng shop để tạo danh sách đơn hàng
    for (const shop of shops) {
      let totalShopPrice = 0;
      const shopItems = [];

      // Duyệt qua các sản phẩm trong shop
      for (const item of shop.orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            status: 'fail',
            message: `Product not found: ${item.product}`,
          });
        }

        const itemTotalPrice = item.quantity * product.price;
        totalShopPrice += itemTotalPrice;

        // Thêm sản phẩm vào danh sách shopItems
        shopItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Cộng phí vận chuyển và trừ giảm giá (nếu có)
      totalOrderPrice += totalShopPrice + (shop.shippingCost || 0) - (shop.voucherDiscount || 0);

      // Thêm shop vào danh sách
      orderData.shops.push({
        shopId: shop.shopId,
        orderItems: shopItems,
        shippingMethod: shop.shippingMethod,
        shippingCost: shop.shippingCost || 0,
        voucherDiscount: shop.voucherDiscount || 0,
        totalShopPrice,
      });
    }

    // Tổng giá trị đơn hàng
    orderData.totalOrderPrice = totalOrderPrice;

    // Tạo order mới
    const order = await Order.create(orderData);

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while creating the order',
      error: error.message,
    });
  }
};
