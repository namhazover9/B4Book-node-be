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
    googleId: {
      type: String,
      default: null,
    },
    authType: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    failedLoginTimes: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    if (this.authType === 'local') {
      const saltRounds = parseInt(process.env.SALT_ROUND);
      //hashing password...
      const hashPassword = await bcrypt.hash(this.password, saltRounds);
      this.password = hashPassword;
      next();
    }
    next();
  } catch (error) {
    next(error);
  }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
