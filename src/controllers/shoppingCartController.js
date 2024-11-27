const Product = require('../models/product');
const Cart = require('../models/shoppingCart');

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item) => {
        totalPrice += item.quantity * item.price;
    });
    cart.totalCartPrice = totalPrice;
    // cart.totalPriceAfterDiscount = undefined;
    return totalPrice;
};

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = async (req, res) => {
    try {
      const { productId } = req.body;
  
      // Lấy userId từ headers
      const userId = req.headers['id'];
  
      if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required in headers' });
      }
  
      // Lấy thông tin sản phẩm từ Product
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ status: 'error', message: 'Product not found' });
      }
  
      // Lấy Cart cho user đã đăng nhập
      let cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        // Tạo mới giỏ hàng nếu chưa tồn tại
        cart = await Cart.create({
          user: userId,
          cartItems: [
            { product: productId, title: product.title, price: product.price, images: product.images },
          ],
        });
      } else {
        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng hay chưa
        const productIndex = cart.cartItems.findIndex(
          (item) => item.product.toString() === productId
        );
  
        if (productIndex > -1) {
          // Sản phẩm đã tồn tại: cập nhật số lượng
          const cartItem = cart.cartItems[productIndex];
          cartItem.quantity += 1;
          cart.cartItems[productIndex] = cartItem;
        } else {
          // Sản phẩm chưa tồn tại: thêm vào giỏ hàng
          cart.cartItems.push({
            product: productId,
            title: product.title,
            price: product.price,
            images: product.images,
          });
        }
      }
  
      // Tính tổng giá trị của giỏ hàng
      calcTotalCartPrice(cart);
  
      // Lưu giỏ hàng
      await cart.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Product added to cart successfully',
        numOfCartItems: cart.cartItems.length,
        data: cart,
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  };
  
  
  
// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = async (req, res) => {
  try {
      const userId = req.headers['id'];
      const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
      const limit = parseInt(req.query.limit) || 10; // Số mục mỗi trang (mặc định là 10)
      const skip = (page - 1) * limit; // Bỏ qua các mục của các trang trước

      console.log("User ID:", userId);

      // Lấy cart của user
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
          return res.status(404).json({
              status: 'error',
              message: `There is no cart for this user id: ${userId}`,
          });
      }

      // Paginate cart items
      const paginatedCartItems = cart.cartItems.slice(skip, skip + limit);

      res.status(200).json({
          status: 'success',
          currentPage: page,
          totalPages: Math.ceil(cart.cartItems.length / limit),
          numOfCartItems: paginatedCartItems.length,
          totalCartItems: cart.cartItems.length,
          data: paginatedCartItems,
      });
  } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
  }
};

  
// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.headers['id']},
            { $pull: { cartItems: { _id: req.params.itemId } } },
            { new: true }
        );

        if (cart) {
            calcTotalCartPrice(cart);
            await cart.save();

            res.status(200).json({
                status: 'success',
                numOfCartItems: cart.cartItems.length,
                data: cart,
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Cart not found for the user',
            });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
  
// @desc    Clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.headers['id'] });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
  
// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.headers['id']});
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `There is no cart for user ${req.headers['id']}`,
            });
        }

        const itemIndex = cart.cartItems.findIndex(
            (item) => item._id.toString() === req.params.itemId
            );

        if (itemIndex > -1) {
            const cartItem = cart.cartItems[itemIndex];
            cartItem.quantity = quantity;
            cart.cartItems[itemIndex] = cartItem;
        } else {
            return res.status(404).json({
                status: 'error',
                message: `There is no item for this id: ${req.params.itemId}`,
            });
        }

        calcTotalCartPrice(cart);
        await cart.save();

        res.status(200).json({
            status: 'success',
            numOfCartItems: cart.cartItems.length,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
  