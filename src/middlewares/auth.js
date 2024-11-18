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
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
        status: "ERROR",
      });
    }
    const decode = jwt.verify(token, process.env.Jwt_sec);
    const roleShop = await Role.findOne({ name: "Shop" });
    req.user = await User.findById(decode._id);
    console.log(req.user.role !== roleShop._id);
    if (req.user.role.toString() !== roleShop._id.toString()) {
      return res.status(404).json({
        message: "U are not Seller",
        status: "ERROR",
      });
    }
    next();
  } catch (error) {}
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
