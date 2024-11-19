const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const Role = require("../models/role");
dotenv.config();

// Check role, only admin can use function belong in admin
const isAdmin = async (req, res, next) => {
  try {
    console.log("Checktoken:", req.headers.token);
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
        status: "ERROR",
      });
    }

    const decode = jwt.verify(token, process.env.Jwt_sec);
    const roleAdmin = await Role.findOne({ name: "Admin" });
    req.user = await User.findById(decode._id);
    console.log(req.user.role.toString() !== roleAdmin._id);
    if (req.user.role.toString() !== roleAdmin._id.toString()) {
      return res.status(404).json({
        message: "U are not Admin ",
        status: "ERROR",
      });
    }
    next();
  } catch (error) {}
};

// Check role, only shop, seller can use function belong in shop
const isShop = async (req, res, next) => {
  try {
    console.log("Checktoken:", req.headers.token);
    const token = req.headers.token?.split(" ")[1]; // Trích xuất token từ headers
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
        status: "ERROR",
      });
    }

    const decode = jwt.verify(token, process.env.Jwt_sec); // Giải mã token
    const roleShop = await Role.findOne({ name: "Shop" }); // Tìm role "Shop"

    if (!roleShop) {
      return res.status(404).json({
        message: "Role 'Shop' not found",
        status: "ERROR",
      });
    }

    req.user = await User.findById(decode._id); // Tìm user dựa trên decode từ token
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
        status: "ERROR",
      });
    }

    // Kiểm tra nếu roleShop._id có trong mảng role của user
    const hasShopRole = req.user.role.some(roleId => roleId.toString() === roleShop._id.toString());
    if (!hasShopRole) {
      return res.status(403).json({
        message: "You are not authorized as a Shop",
        status: "ERROR",
      });
    }

    next(); // Nếu hợp lệ, chuyển tiếp sang middleware tiếp theo
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: "ERROR",
    });
  }
};


// Compare when users use website without login, they can see homepage but can not use any function in website
const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Login first",
        status: "ERROR",
      });
    }
    const decode = jwt.verify(token, process.env.Jwt_sec);
    req.user = await User.findById(decode._id);
    if (!req.user) {
      return res.status(404).json({
        message: "Login first",
        status: "ERROR",
      });
    }
    next();
  } catch (error) {}
};

module.exports = {
  isAdmin,
  isShop,
  isAuth,
};
