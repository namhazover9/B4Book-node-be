const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "delivered",
        "cancelled",
        "refunded",
      ],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const OrderHeader = mongoose.model("OrderHeader", userSchema);

module.exports = OrderHeader;
