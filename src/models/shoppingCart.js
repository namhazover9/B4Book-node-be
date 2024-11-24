const mongoose = require("mongoose");

const shoppingCartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        title: {type: String},
        quantity: {
          type: Number,
          default: 1,
        },
        price: {type:Number},
        images: [{type:String}],
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);


const shoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);

module.exports = shoppingCart;
