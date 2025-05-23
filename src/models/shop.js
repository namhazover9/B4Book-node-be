const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopEmail: { type: String, required: true, unique: true },
    shopName: { type: String, required: true, unique: true },
    address: [
      { 
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false }, 
      },
    ],
    description: { type: String},
    documents: [{ type: String, required: true }],
    phoneNumber: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    isApproved:{ type: Boolean, required: true },
    images: [{ type: String}],
    wallet: { type: Number, default: 0},
    revenue: [
      {
        month: { type: String, required: true },
        amount: { type: Number, default: 0 },
      },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    revenue: [
      {
        month: { type: String},
        amount: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
