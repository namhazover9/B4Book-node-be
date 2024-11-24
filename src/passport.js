const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID, // Your Credentials here.
      clientSecret: process.env.CLIENT_SECRET, // Your Credentials here.
      callbackURL: "/auth/google/callback",
      scope: ["email", "profile"],
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB, // Your Credentials here.
      clientSecret: process.env.CLIENT_SECRET_FB, // Your Credentials here.
      callbackURL: "/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);
