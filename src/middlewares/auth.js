const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const Role = require("../models/role");
const Shop = require("../models/shop");
dotenv.config();

// Check role, only admin can use function belong in admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1]; // Trích xuất token từ headers
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
        status: "ERROR",
      });
    }

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN); // Giải mã token
    const roleCustomer = await Role.findOne({ name: "Admin" }); // Tìm role "Customer"

    if (!roleCustomer) {
      return res.status(404).json({
        message: "Role 'Admin' not found",
        status: "ERROR",
      });
    }

    req.user = await User.findById(decode.sub.accountId); // Tìm user dựa trên decode từ token
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
        status: "ERROR",
      });
    }

    // Kiểm tra nếu roleCustomer._id có trong mảng role của user
    const hasCustomerRole = req.user.role.some(roleId => roleId.toString() === roleCustomer._id.toString());
    if (!hasCustomerRole) {
      return res.status(403).json({
        message: "You are not authorized as a Customer",
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

// Check role, only shop, seller can use function belong in shop
const isShop = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1]; // Trích xuất token từ headers
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
        status: "ERROR",
      });
    }
    
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN); // Giải mã token
    req.user = await Shop.findOne({user:decode.sub.accountId}); // Tìm user dựa trên decode từ token
    if (!req.user) {
      return res.status(404).json({
        message: "Shop not found",
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
      const decode = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = await User.findById(decode.sub.accountId);
      if (!req.user) {
        return res.status(404).json({
          message: "Login first",
          status: "ERROR",
        });
      }
      next();
    } catch (error) {}
  };

const isCustomer = async (req, res, next) => {
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
    const roleCustomer = await Role.findOne({ name: "Customer" }); // Tìm role "Customer"

    if (!roleCustomer) {
      return res.status(404).json({
        message: "Role 'Customer' not found",
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

    // Kiểm tra nếu roleCustomer._id có trong mảng role của user
    const hasCustomerRole = req.user.role.some(roleId => roleId.toString() === roleCustomer._id.toString());
    if (!hasCustomerRole) {
      return res.status(403).json({
        message: "You are not authorized as a Customer",
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
module.exports = {
  isAdmin,
  isShop,
  isAuth,
  isCustomer
};
