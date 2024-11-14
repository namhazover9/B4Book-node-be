const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    shopEmail: { type: String, required: true, unique: true },
    shopName: { type: String, required: true, unique: true },
    shopAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Shop = mongoose.model("Shop", userSchema);

module.exports = Shop;
