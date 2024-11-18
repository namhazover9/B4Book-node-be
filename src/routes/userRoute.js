const express = require("express");
const router = express();
const passport = require("passport");
require("../passport");

router.use(passport.initialize());
router.use(passport.session());

const userController = require("../controllers/userController");
const { isAuth } = require("../middlewares/auth");

router.get("/", userController.loadAuth);
// router.post("/createRole", userController.createRole);
// Auth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Auth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  })
);

// facebook root
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

// facebook callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/successLoginFacebook",
    failureRedirect: "/failed",
  })
);
router.get("/Userprofile", isAuth, userController.showProfile);
router.get("/successLoginFacebook", userController.FacebookLogin);
router.get("/homepage", userController.renderHomePage);
router.post("/registerShop",isAuth, userController.registerShop);
router.get("/failed", (req, res) => {
  res.send("U are not valid user");
});

router.get("/showAllUser", userController.showAllUser);
// Success
router.get("/success", userController.GoogleLogin);

// failure
router.get("/failure", userController.failureGoogleLogin);

module.exports = router;
