const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    ISBN: { type: String, required: true },
    language: { type: String, required: true },
    stock: { type: Number, required: true },
    isApproved: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
    category: [{type: String, required: true}],
    countClick: { type: Number, default: 0},
    numberOfRating: { type: Number, default: 0},
    rating: { type: Number, default: 0},
    salesNumber: { type: Number, default: 0},
    images: [{ type: String, required: true }], // URLs of the images
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
