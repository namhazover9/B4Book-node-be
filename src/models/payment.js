const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderHeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderHeader",
      required: true,
    },
    amount: {
      type: Number,
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
    transition_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
