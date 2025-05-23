const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shops: [
      {
        shopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Shop', // Shop's user ID
          required: true,
        },
        orderItems: [
          {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            title: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }, 
            images: [{ type: String, required: true }],
          },
        ],
        shippingCost: { type: Number, required: true},
        status: {
          type: String,
          enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
          default: 'Pending',
        },
        shippedDate: { type: Date, default: null },
        deliveredDate: { type: Date, default: null },
        voucherDiscount: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher'},
        totalShopPrice: { type: Number},
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String},
      country: { type: String},
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Credit Card'],
      required: true,
    },
    totalOrderPrice: { type: Number, required: true }, // Tổng giá trị đơn hàng (bao gồm phí vận chuyển)
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
