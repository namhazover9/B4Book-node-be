const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    value: { type: Number, required: true },
    expired: { type: Date, required: true },
    validDate:{type:Date,required:true},
    isActive: { type: Boolean, required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
  }
);

const Voucher = mongoose.model("Voucher", userSchema);

module.exports = Voucher;
