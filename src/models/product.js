const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    ISBN: { type: String, required: true },
    language: { type: String, required: true },
    public_date: { type: Date, required: true },
    stock: { type: Number, required: true },
    isApproved: { type: Boolean, required: true },
    isDeleted: { type: Boolean, required: true },
    inventory: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Invetory",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", userSchema);

module.exports = Product;
