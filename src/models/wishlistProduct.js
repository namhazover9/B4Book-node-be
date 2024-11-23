const mongoose = require("mongoose");

const wishlistProductSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product"},
    },
    { timestamps: true }
);

const WishlistProduct = mongoose.model("WishlistProduct", wishlistProductSchema);

module.exports = WishlistProduct;
