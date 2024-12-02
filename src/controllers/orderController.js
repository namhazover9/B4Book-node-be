const Order = require('../models/order');
const Product = require('../models/product');
const Cart = require('../models/shoppingCart');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key
const crypto = require('crypto');
const querystring = require('querystring');
const moment = require('moment');
let $ = require('jquery');
const request = require('request');



// @desc    Get cart data for order
// @route   GET /order/cart-data
// @access  Private/Customer
exports.getCartForOrder = async (req, res) => {
  try {
    // Tìm giỏ hàng của người dùng hiện tại

    const cart = await Cart.findOne({ user:req.user._id }).populate('cartItems.product');


    // Kiểm tra nếu không có giỏ hàng hoặc giỏ hàng rỗng
    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Shopping cart is empty',
      });
    }

    // Gom nhóm các sản phẩm theo Shop
    const shopsMap = new Map();
    let subTotal = 0;

    // Duyệt qua các sản phẩm trong giỏ hàng
    cart.cartItems.forEach((item) => {
      const product = item.product;
      if (!product) {
        // Nếu không có thông tin sản phẩm, bỏ qua sản phẩm này
        console.log('Warning: Product data is missing for cart item', item);
        return;
      }

      const shopId = product.shopId ? product.shopId.toString() : null;
      if (!shopId) {
        // Nếu không có shopId trong sản phẩm, bỏ qua sản phẩm này
        console.log('Warning: Product has no shopId', product);
        return;
      }

      // Nếu chưa có shop này trong Map, tạo mới
      if (!shopsMap.has(shopId)) {
        shopsMap.set(shopId, {
          shopId,
          orderItems: [],
          shippingCost:  0,
          voucherDiscount:  0,
        });
      }

      // Tính tổng giá tiền của sản phẩm
      const totalPrice = item.quantity * product.price;
      subTotal += totalPrice;

      // Thêm sản phẩm vào danh sách orderItems của Shop
      shopsMap.get(shopId).orderItems.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        price: product.price,
        images: product.images,
      });
    });

    // Chuyển từ Map sang mảng để dễ sử dụng
    const shops = Array.from(shopsMap.values());

    // Trả về thông tin giỏ hàng cho Order
    res.status(200).json({
      status: 'success',
      message: 'Cart data retrieved successfully',
      data: {
        userName: req.user.userName,
        shops,
        subTotal, // Tổng giá trị của các sản phẩm
        shippingAddress: req.user.address || {}, // Nếu người dùng có địa chỉ mặc định
        paymentMethod: ['COD', 'Credit Card'], 
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



// @desc    Get All Orders of a Customer
// @route   GET /customer/:id (id = customer ID)
// @access  Private/Shop-Customer-Admin
exports.getCustomerOrders = async (req, res) => {
  try {
    // Tìm tất cả các order của Customer hiện tại
    const orders = await Order.find({ customer: req.user._id }).populate({
      path: 'shops.orderItems.product',
      select: 'title price images',
    });

    // Kiểm tra nếu không có Order nào
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No orders found for this customer',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Orders retrieved successfully',
      numOfOrders: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error retrieving customer orders:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving orders',
      error: error.message,
    });
  }
};

// @desc    Get Order by Id
// @route   GET /:orderId 
// @access  Private/Shop-Customer-Admin
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Tìm order dựa trên ID và Customer hiện tại
    const order = await Order.findOne({ _id: orderId , customer: req.user._id }).populate({
      path: 'shops.orderItems.product',
      select: 'title price images',
    });
    
    // Kiểm tra nếu không tìm thấy Order
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found or does not belong to this customer',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error retrieving order by ID:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving the order',
      error: error.message,
    });
  }
};

// @desc    Get All Orders by Status
// @route   GET /by-status?status=<status> (Pending, Confirmed, Shipped, Delivered, Cancelled)
// @access  Private/Shop-Customer-Admin
exports.getAllOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    // Kiểm tra nếu status không hợp lệ
    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
      });
    }

    // Tìm tất cả các orders theo status
    const orders = await Order.find({ status }).populate({
      path: 'customer',
      select: 'userName email',
    }).populate({
      path: 'shops.orderItems.product',
      select: 'title price images',
    });

    // Kiểm tra nếu không có Order nào
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No orders found with status: ${status}`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Orders with status "${status}" retrieved successfully`,
      numOfOrders: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error retrieving orders by status:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving orders by status',
      error: error.message,
    });
  }
};


exports.getAllOrderByShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const status = req.query.status;

    // Xây dựng bộ lọc trạng thái
    let statusFilter = {};

    // Kiểm tra giá trị status và xử lý
    if (status && status !== "default") { // Kiểm tra nếu status không phải "default"
      switch (status) {
        case "Pending":
        case "Confirmed":
        case "Shipped":
        case "Delivered":
        case "Cancelled":
          statusFilter.status = status;
          break;
        default:
          return res.status(400).json({ message: "Invalid status value." });
      }
    }

    // Lọc các đơn hàng từ database
    const orders = await Order.find({
      "shops.shopId": shopId, // Lọc các shop có shopId phù hợp
      ...statusFilter, // Thêm bộ lọc trạng thái nếu có
    })
      .populate({
        path: "shops.orderItems.product", // Lấy thông tin chi tiết sản phẩm
        select: "name price images", // Các trường cần lấy của sản phẩm
      })
      .populate({
        path: "customer", // Lấy thông tin chi tiết khách hàng
        select: "userName email phoneNumber", // Các trường cần lấy của khách hàng
      })
      .sort({ createdAt: -1 }); // Sắp xếp đơn hàng mới nhất ở trên cùng

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this shop." });
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};








// @desc    Create Stripe Checkout Session
// @route   POST /order/place-order
// @access  Private/Customer

// exports.placeOrder = async (req, res) => {
//   try {
//     const { shops, shippingAddress, paymentMethod } = req.body;

//     if (!shops || shops.length === 0) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Shops cannot be empty',
//       });
//     }

//     let totalOrderPrice = 0;
//     const orderItems = [];

//     // Prepare order items and calculate total price
//     for (const shop of shops) {
//       for (const item of shop.orderItems) {
//         const product = await Product.findById(item.product);
//         if (!product || product.stock < item.quantity) {
//           return res.status(400).json({
//             status: 'fail',
//             message: `Product out of stock or not available: ${item.product}`,
//           });
//         }

//         const itemTotal = product.price * item.quantity;
//         totalOrderPrice += itemTotal;

//         orderItems.push({
//           product: product._id,
//           title: product.title,
//           price: product.price,
//           quantity: item.quantity,
//         });
//       }
//     }

//     // If payment method is Credit Card, create Stripe Checkout Session
//     if (paymentMethod === 'Credit Card') {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         mode: 'payment',
//         customer_email: req.user.email,
//         line_items: orderItems.map((item) => ({
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: item.title,
//             },
//             unit_amount: Math.round(item.price * 100),
//           },
//           quantity: item.quantity,
//         })),
//         success_url: `${process.env.CLIENT_URL}/order/success`, // Replace with your frontend success page
//         cancel_url: `${process.env.CLIENT_URL}/order/cancel`,   // Replace with your frontend cancel page
//         metadata: {
//           userId: req.user._id .toString(),
//           shops: JSON.stringify(shops),
//           shippingAddress: JSON.stringify(shippingAddress),
//           paymentMethod,
//         },
//       });

//       return res.status(200).json({
//         status: 'success',
//         message: 'Stripe session created',
//         sessionId: session.id,
//       });
//     }

//     res.status(400).json({
//       status: 'fail',
//       message: 'Payment method not supported',
//     });
//   } catch (error) {
//     console.error('Error creating Stripe session:', error.message);
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went wrong while creating Stripe session',
//       error: error.message,
//     });
//   }
// };


// exports.stripeWebhook = async (req, res) => {
//   let event;

//   try {
//     const signature = req.headers['stripe-signature'];
//     event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     console.error('Stripe Webhook Error:', error.message);
//     return res.status(400).json({ message: `Webhook Error: ${error.message}` });
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;

//     try {
//       const userId = session.metadata.userId;
//       const shops = JSON.parse(session.metadata.shops);
//       const shippingAddress = JSON.parse(session.metadata.shippingAddress);
//       const paymentMethod = session.metadata.paymentMethod;

//       let totalOrderPrice = 0;

//       // Update stock and sales, calculate total order price
//       for (const shop of shops) {
//         for (const item of shop.orderItems) {
//           const product = await Product.findById(item.product);
//           if (product) {
//             product.stock -= item.quantity;
//             product.salesNumber += item.quantity;

//             if (product.stock < 0) {
//               console.warn(`Stock for product ${product.title} is below zero!`);
//             }

//             await product.save();
//           }

//           totalOrderPrice += item.quantity * item.price;
//         }
//       }

//       // Create the order
//       const order = await Order.create({
//         customer: userId,
//         shops,
//         shippingAddress,
//         paymentMethod,
//         totalOrderPrice,
//         status: 'Pending',
//       });

//       // Clear the user's cart
//       await Cart.findOneAndUpdate({ user: userId }, { cartItems: [] });

//       console.log(`Order ${order._id} created successfully.`);
//     } catch (error) {
//       console.error(`Error creating order after Stripe payment: ${error.message}`);
//     }
//   }

//   res.status(200).json({ received: true });
// };


// @desc    Create VNPAY Checkout Session
// @route   POST /order/place-order
// @access  Private/Customer
exports.createVNpay =  async (req, res, next) => {
try {
    const { shops, shippingAddress, paymentMethod, customerId } = req.body;

    if (!shops || shops.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Shops cannot be empty',
      });
    }

    let totalOrderPrice = 0;
    const orderItems = [];

    const orderData = {
      customer:req.user._id , // ID của khách hàng hiện tại
      shops: [],
      shippingAddress,
      paymentMethod,
    };

    // Duyệt qua từng shop để tạo danh sách đơn hàng
    for (const shop of shops) {
      for (const item of shop.orderItems) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            status: 'fail',
            message: `Product out of stock or not available: ${item.product}`,
          });
        }

        const itemTotal = product.price * item.quantity;
        totalOrderPrice += itemTotal;

        orderItems.push({
          product: product._id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
        });
      }
    }  

    
    if (paymentMethod === 'VNPAY') {

      // Create the order
      const order = await Order.create({
        customer: customerId,
        shops,
        shippingAddress,
        paymentMethod,
        totalOrderPrice,
        status: 'Pending',
      });

      process.env.TZ = 'Asia/Ho_Chi_Minh';
      
      let date = new Date();
      let createDate = moment(date).format('YYYYMMDDHHmmss');
      
      let ipAddr = req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;

      // let config = require('config');
      
      let tmnCode = "AL7AF468";
      let secretKey = "8E2BMWQA53PTVWZV7QR1KK1RO01KPK2F";
      let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      let returnUrl = "http://localhost:8000/order/vnpay-return";
      let orderInfo = moment(date).format('DDHHmmss');
      //let amount = req.body.amount;
      let bankCode = 'VNBANK';
      let orderId = order._id;

      let locale = 'vn';
      let currCode = 'VND';
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = orderId;
      vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderInfo;
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = totalOrderPrice * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = ipAddr;
      vnp_Params['vnp_CreateDate'] = createDate;      
      vnp_Params['vnp_BankCode'] = bankCode;
      

      vnp_Params = sortObject(vnp_Params);

      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");     
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

       
      return res.status(200).json({
        status: 'success',
        message: 'VNPAY payment URL generated',
        vnpUrl,
        orderId
      });
    }  
  }catch (error) {
    console.error('Error creating Stripe session:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while creating Stripe session',
      error: error.message,
    });
  }
};


exports.vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = "8E2BMWQA53PTVWZV7QR1KK1RO01KPK2F";

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    let orderId = vnp_Params['vnp_TxnRef'];
   
    if(secureHash === signed){
      let order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({code: '01', message: 'Order not found' });
      }
      
      order.isPaid = true;
      await order.save();
      return res.status(200).json({
        code: vnp_Params['vnp_ResponseCode'],
        message: 'Transaction verified successfully',
      });
    } else {
      return res.status(400).json({
        code: '97',
        message: 'Checksum verification failed',
    });
    }
    

  } catch (error) {
    console.error('VNPAY return error:', error.message);
    res.status(500).json({ status: 'error', message: 'Something went wrong', error: error.message });
  }
};


function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
    str.push(encodeURIComponent(key));
    }
  }
  str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}