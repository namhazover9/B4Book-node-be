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
    salesNumber: { type: Number,default: 0},
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
    images: [{ type: String, required: true }],
    countClick: { type: Number,default: 0},
    ratingResult: { type: Number,default: 0},
    feedBacks:[
      {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment:{type: String,required: true},
      createdAt: { type: Date, default: Date.now },
      rating: { type: Number},
    }
  ]
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
