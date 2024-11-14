const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productImage = mongoose.model("productImage", userSchema);

module.exports = productImage;
