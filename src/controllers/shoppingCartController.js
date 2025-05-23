const Product = require('../models/product');
const ShoppingCart = require('../models/shoppingCart');

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
// @route   POST /cart/add
// @access  Private/Customer
exports.addProductToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    let cart = await ShoppingCart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await ShoppingCart.create({
        user: req.user._id,
        cartItems: [
          {
            product: productId,
            title: product.title,
            price: product.price,
            images: product.images,
            quantity: quantity, // Thêm số lượng
          },
        ],
      });
    } else {
      const productIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex > -1) {
        cart.cartItems[productIndex].quantity += quantity; // Cộng thêm quantity
      } else {
        cart.cartItems.push({
          product: productId,
          title: product.title,
          price: product.price,
          images: product.images,
          quantity: quantity, // Thêm quantity cho sản phẩm mới
        });
      }
    }

    calcTotalCartPrice(cart);
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
// @route   GET /
// @access  Private/Customer
exports.getLoggedUserCart = async (req, res) => {
  try {
    const userId = req.user._id ;
    const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
    const limit = parseInt(req.query.limit) || 10; // Số mục mỗi trang (mặc định là 10)
    const skip = (page - 1) * limit; // Bỏ qua các mục của các trang trước
    // Lấy cart của user
    const cart = await ShoppingCart.findOne({ user: userId }).populate({
      path: "cartItems.product",
      model: "Product",
      select: "title description price images author publisher ISBN language stock category shopId",
      populate: {
        path: "shopId",
        model: "Shop", // Tên model của bảng Shop
        select: "shopEmail shopName shopAddress", // Chỉ lấy các trường cần thiết từ Shop
      },
    });
    // Xử lý khi giỏ hàng không tồn tại hoặc không có sản phẩm
    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).json({
        status: 'success',
        currentPage: page,
        totalPages: 0,
        numOfCartItems: 0,
        totalCartItems: 0,
        data: [], // Trả về mảng trống
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
// @route   DELETE /cart/:itemId
// @access  Private/Customer
exports.removeSpecificCartItem = async (req, res) => {
    try {
        const cart = await ShoppingCart.findOneAndUpdate(
            { user: req.user._id },
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
// @route   /cart
// @access  Private/Customer
exports.clearCart = async (req, res) => {
    try {
        await ShoppingCart.findOneAndDelete({ user: req.user._id  });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
  
// @desc    Update specific cart item quantity
// @route   PUT /cart/:itemId
// @access  Private/Customer
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await ShoppingCart.findOne({ user:req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `There is no cart for user ${req.user._id }`,
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
  