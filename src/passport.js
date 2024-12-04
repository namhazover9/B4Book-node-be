const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require("passport-google-token").Strategy;
const FacebookStrategy = require("passport-facebook-token");
const User = require('./models/user');
const Role = require('./models/role');
const bcrypt = require("bcryptjs");
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
      scope: ['profile', 'email'],  // Yêu cầu quyền truy cập profile và email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const hash = await bcrypt.hash("Xinchaocacban", 10);
        const { id, name, emails } = profile;
        const { familyName, givenName } = name;
        const email = emails[0].value;

        // Lấy avatar từ trường picture
        const avartar = profile._json.picture || '';
        // Kiểm tra người dùng đã tồn tại hay chưa
        let user = await User.findOne({authProvider: 'google',email:email });
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
            avartar: avartar,  // Lưu avatar vào trường avatar
            role: [defaultRole._id],  // Gán ObjectId của vai trò vào trường role
            passWord: hash
          });

          await user.save();
        }

        // Cập nhật thời gian đăng nhập
        user.lastLogin = Date.now();
        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Error in GoogleStrategy:', error.message);
        done(error, null);
      }
    }
  )
);


passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FB, // Your Credentials here.
      clientSecret: process.env.CLIENT_SECRET_FB, // Your Credentials here.
      profileFields: ['id', 'emails', 'name', 'photos'], 
      fbGraphVersion: 'v3.0',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, name, emails } = profile;

        const displayName = name.familyName + ' ' + name.givenName;
        const email = emails[0].value;

        // Lấy avatar từ picture.data.url
        const avatar = profile._json.picture ? profile._json.picture.data.url : '';

        // Kiểm tra người dùng đã tồn tại hay chưa
        let user = await User.findOne({ email: email, authProvider: 'facebook' });

        if (!user) {
          // Tìm vai trò mặc định 'user' trong cơ sở dữ liệu
          const defaultRole = await Role.findOne({ name: 'Customer' });

          if (!defaultRole) {
            throw new Error('Default role "Customer" not found.');
          }

          // Tạo người dùng mới
          user = new User({
            email,
            userName: displayName,
            lastLogin: new Date(),
            isActive: true,
            authProvider: 'facebook',
            facebookId: id,
            avartar: avatar,  // Sử dụng avatar từ picture.data.url
            role: [defaultRole._id], // Gán ObjectId của vai trò vào trường role
          });

          await user.save();
        }

        user.lastLogin = Date.now();
        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Error in FacebookStrategy:', error.message);
        done(error, null);
      }
    }
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