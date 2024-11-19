const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopEmail: { type: String, required: true, unique: true },
    shopName: { type: String, required: true, unique: true },
    shopAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    avartar: { type: String, required: true },
    isApproved:{ type: Boolean, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
