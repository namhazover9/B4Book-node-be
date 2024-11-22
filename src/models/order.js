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
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }, // Giá tại thời điểm mua
          },
        ],
        shippingMethod: {
          type: String,
          enum: ['Standard', 'Express'],
          required: true,
        },
        shippingCost: { type: Number, default: 0 },
        voucherDiscount: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher'},
        totalShopPrice: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Credit Card', 'PayPal'],
      required: true,
    },
    totalOrderPrice: { type: Number, required: true }, // Tổng giá trị đơn hàng (bao gồm phí vận chuyển)
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
