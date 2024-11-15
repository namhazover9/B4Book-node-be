const path = require("path");
const User = require("../models/user");
const Role = require("../models/role");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const loadAuth = (req, res) => {
  res.render(path.join(__dirname, "../views/user.ejs"));
};

const GoogleLogin = async (req, res) => {
  if (!req.user || !req.user.email || !req.user.name) {
    return res.status(400).send("User data is missing.");
  }

  try {
    let user = await User.findOne({
      email: req.user.email,
      isActive: true,
      authProvider: "google",
    });
    const customerRole = await Role.findOne({
      name: "Shop",
    });
    if (!user) {
      user = await User.create({
        email: req.user.email,
        userName: `${req.user.name.givenName} ${req.user.name.familyName}`,
        lastLogin: Date.now(),
        isActive: true,
        authProvider: "google",
        role: customerRole ? [customerRole._id] : [],
      });
      console.log("Create Success");
    }
    const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    res.json({
      success: true,
      message: "Google login successful",
      verifyToken,
    });
    console.log("User:", user);
  } catch (error) {
    console.error("Error in successGoogleLogin:", error);
    res.status(500).send("An error occurred during Google login.");
  }
};

// function login by facebook
const FacebookLogin = async (req, res) => {
  if (!req.user) res.redirect("/failure");
  console.log(req.user);
  const email = req.user.emails
    ? req.user.emails[0].value
    : "Email not provided";

  if (!req.user || !email || !req.user.displayName) {
    return res.status(400).send("User data is missing.");
  }

  try {
    let user = await User.findOne({
      email: email,
      isActive: true,
      authProvider: "facebook",
    });
    const customerRole = await Role.findOne({
      name: "Customer",
    });
    if (!user) {
      user = await User.create({
        email: email,
        userName: req.user.displayName,
        lastLogin: Date.now(),
        isActive: true,
        role: customerRole ? [customerRole._id] : [],
        authProvider: "facebook",
      });
      console.log("Create Success");
    }
    const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
      expiresIn: "5m",
    });
    res.json({
      success: true,
      message: "Facebook login successful",
      verifyToken,
    });
    console.log("User:", user);
  } catch (error) {
    console.error("Error in successFacebookLogin:", error);
    res.status(500).send("An error occurred during Facebook login.");
  }
};

const failureGoogleLogin = (req, res) => {
  res.send("Error");
};

const failureFacebookLogin = (req, res) => {
  res.send("Error");
};

module.exports = {
  loadAuth,
  GoogleLogin,
  failureGoogleLogin,
  FacebookLogin,
  failureFacebookLogin,
};
