const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    amount: { type: Number, required: true }, // Số tiền muốn rút
    status: { 
      type: String, 
      enum: ["Pending", "Paid", "Rejected"], 
      default: "Pending" 
    }, 
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date }, // Ngày xử lý yêu cầu
  });
  
  const WithdrawRequest = mongoose.model("WithdrawRequest", withdrawRequestSchema);
  
 module.exports = WithdrawRequest;