const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema(
  {
    orderHeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderHeader",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);

module.exports = OrderDetail;
