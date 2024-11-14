const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    lastLogin: { type: Date, required: true },
    isActive: { type: Boolean, required: true },
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
