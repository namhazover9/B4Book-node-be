const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    userName: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },
    lastLogin: { type: Date, required: true },
    isActive: { type: Boolean, required: true },
    avartar: { type: String },
    authProvider: { type: String, required: true },
    passWord: { type: String},
    role: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
