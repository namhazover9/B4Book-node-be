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
        const product = await Product.findById(productId);

        // 1) Get Cart for logged user
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
        // Create cart for logged user with product
            cart = await Cart.create({
                user: req.user._id,
                cartItems: [{ product: productId,  price: product.price }],
            });
        } else {
        // Product exists in cart, update product quantity
            const productIndex = cart.cartItems.findIndex(
                (item) => item.product.toString() === productId 
            );

            if (productIndex > -1) {
                const cartItem = cart.cartItems[productIndex];
                cartItem.quantity += 1;
                cart.cartItems[productIndex] = cartItem;
            } else {
                // Product not exist in cart, push product to cartItems array
                cart.cartItems.push({ product: productId, price: product.price });
            }
        }

        // Calculate total cart price
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
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        console.log("cart", req.user._id);
        if (!cart) {
        return res.status(404).json({
            status: 'error',
            message: `There is no cart for this user id: ${req.user._id}`,
        });
        }

        res.status(200).json({
        status: 'success',
        numOfCartItems: cart.cartItems.length,
        data: cart,
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
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
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

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `There is no cart for user ${req.user._id}`,
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
  