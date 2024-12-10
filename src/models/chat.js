
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [{ type:String, required: true }], 
    customerMessages: [
      {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    shopMessages: [
      {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
