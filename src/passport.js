const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-token').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require('./models/user');
const Role = require('./models/role');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, name, emails } = profile;
        const { familyName, givenName } = name;
        const email = emails[0].value;

        // Kiểm tra người dùng đã tồn tại hay chưa
        let user = await User.findOne({ googleId: id, authProvider: 'google' });

        if (!user) {
          // Tìm vai trò mặc định 'user' trong cơ sở dữ liệu
          const defaultRole = await Role.findOne({ name: 'Customer' });

          if (!defaultRole) {
            throw new Error('Default role "Customer" not found.');
          }

          // Tạo người dùng mới
          user = new User({
            email,
            userName: `${familyName} ${givenName}`,
            lastLogin: new Date(),
            isActive: true,
            authProvider: 'google',
            googleId: id,
            lastLogin: Date.now(),
            isActive: true,
            avatar: req.user.photos ? req.user.photos[0].value : '', 
            role: [defaultRole._id], // Gán ObjectId của vai trò vào trường role
          });

          await user.save();
        }
        user.lastLogin = Date.now();
        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Error in GoogleStrategy:', error.message);
        done(error, null);
      }
    },
  ),
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
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, name, emails } = profile;
        const { userName } = name;
        const email = emails[0].value;

        // Kiểm tra người dùng đã tồn tại hay chưa
        let user = await User.findOne({ facebookId: id, authProvider: 'facebook' });

        if (!user) {
          // Tìm vai trò mặc định 'user' trong cơ sở dữ liệu
          const defaultRole = await Role.findOne({ name: 'Customer' });

          if (!defaultRole) {
            throw new Error('Default role "Customer" not found.');
          }

          // Tạo người dùng mới
          user = new User({
            email,
            userName: userName,
            lastLogin: new Date(),
            isActive: true,
            authProvider: 'facebook',
            googleId: id,
            lastLogin: Date.now(),
            isActive: true,
            avatar: req.user.photos ? req.user.photos[0].value : '', 
            role: [defaultRole._id], // Gán ObjectId của vai trò vào trường role
          });

          await user.save();
        }
        user.lastLogin = Date.now();
        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Error in GoogleStrategy:', error.message);
        done(error, null);
      }
    },
  )
);

const jwtAuthentication = async (req, res, next) => {
  try {
    res.locals.isAuth = false;
    let token = req.cookies?.access_token || req.query?.token;
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const accountId = decoded.sub.accountId;

    const user = await User.findById(accountId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Lưu người dùng vào req
    res.locals.isAuth = true;
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Authentication Error:", error);
    return res.status(401).json({ message: "Unauthorized." });
  }
};

module.exports = { jwtAuthentication };