const path = require("path");
const User = require("../models/user");
const Shop = require("../models/shop");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const WishlistProduct = require("../models/wishlistProduct");
const Product = require("../models/product");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../middlewares/sendEmailPassword");
const { generateRandomCode } = require("../middlewares/generateCode");
const { data } = require("jquery");
dotenv.config();
const loadAuth = (req, res) => {
  res.render(path.join(__dirname, "../views/user.ejs"));
};

// const GoogleLogin = async (req, res) => {
//   if (!req.user || !req.user.email || !req.user.name) {
//     return res.status(400).send("User data is missing.");
//   }

//   try {
//     // Kiểm tra nếu người dùng đã tồn tại với Google login
//     let user = await User.findOne({
//       email: req.user.email,
//       authProvider: "google",
//     });
//     if (user.isActive === false) {
//       return res.json({
//         success: false,
//         message: "Your account is not active",
//       });
//     }
//     const customerRole = await Role.findOne({ name: "Customer" });
//     if (!user) {
//       user = await User.create({
//         email: req.user.email,
//         userName: `${req.user.name.givenName} ${req.user.name.familyName}`,
//         lastLogin: Date.now(),
//         isActive: true,
//         avatar: req.user.photos ? req.user.photos[0].value : '', 
//         authProvider: "google",
//         role: customerRole ? [customerRole._id] : [],
//       });
//       console.log("User created successfully:", user);
//       const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
//         expiresIn: "5m",
//       });
//       return res.json({
//        success: true,
//        message:"New user",
//       verifyToken,
//       })
//     }

//     // Tạo JWT token cho người dùng
//     const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
//       expiresIn: "5m",
//     });
//     return res.json({
//       message: "Login success",
//       verifyToken,
//     })
//   } catch (error) {
//     console.error("Error in Google login:", error);
//     return res.status(500).send("An error occurred during Google login.");
//   }
// };

// // function login by facebook
// const FacebookLogin = async (req, res) => {
//   const email = req.user.emails
//     ? req.user.emails[0].value
//     : "Email not provided";

//   if (!req.user || !email || !req.user.displayName) {
//     return res.status(400).send("User data is missing.");
//   }

//   try {
//     let user = await User.findOne({
//       email: email,
//       authProvider: "facebook",
//     });
//     if (user.isActive === false) {
//       return res.json({
//         success: false,
//         message: "Your account is not active",
//       });
//     }
//     const customerRole = await Role.findOne({
//       name: "Admin",
//     });
//     if (!user) {
//       user = await User.create({
//         email: email,
//         userName: req.user.displayName,
//         lastLogin: Date.now(),
//         isActive: true,
//         avartar: req.user.photos[0].value,
//         role: customerRole ? [customerRole._id] : [],
//         authProvider: "facebook",
//       });
//       console.log("Create Success");
//     }
//     const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
//       expiresIn: "5m",
//     });
//     return res.json({
//       message: "Login success",
//       verifyToken,
//     })
//   } catch (error) {
//     console.error("Error in successFacebookLogin:", error);
//     res.status(500).send("An error occurred during Facebook login.");
//   }
// };

// add password function

const addPassword = async (req, res) => {
  const { passWord } = req.body;
  try {
    const hash = await bcrypt.hash(passWord, 10);
    const user = await User.findByIdAndUpdate(req.user._id ,{
      passWord:hash},
      { new: true });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    console.log(user);
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
  }
};

// login by gmail and password
// const loginWithPassword = async(req,res) =>{
//   const {email, passWord} = req.body;
//   try {
    
//     const user = await User.findOne({
//      email:email,
//      authProvider:"google"
//     });
//     if(!user){
//       return res.status(404).send({message:"User not found"});
//     }
//     if(user.isActive === false){
//       return res.status(404).send({message:"Your account is not active", success: false});
//     }
//     const comparePassword = await bcrypt.compare(passWord,user.passWord);
//     if(!comparePassword){
//       return res.status(404).send({message:"Wrong password"});
//     }
//     const verifyToken = jwt.sign({ user }, process.env.Activation_sec, {
//       expiresIn: "5m",
//     });
//     res.json({
//       success: true,
//       message: "Login success",
//       verifyToken,
//     });
//   }catch(error){
//     Console.log(error)
//   }
  
// }

// send verify code when forgot password
const sendVerifyCode = async (req, res) => {
  try {
    const {email} = req.body;
    const randomeCode = generateRandomCode(6);
    const user = await User.findOne({ email: email, authProvider: "google" });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const verify = jwt.sign({user, randomeCode}, process.env.Activation_sec, {expiresIn: "5m"});
    await sendMail(user.email, "VerifyToken", randomeCode);
    return res.json({
      success: true,
      message: "Verify code sent successfully",
      verify,
    });
  } catch (error) {
    console.log(error);
  }
} 

// reset password fucntion
const forgotPassword = async (req, res) => {
  const { email, newPassword, verifyToken, randomeCode } = req.body;
 
  // generate random code function
 
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const verify = jwt.verify(verifyToken, process.env.Activation_sec);

    if (!verify) {
      return res.status(400).json({
        isAuth: false,
        message: "code Expired",
      });
    }
    console.log(verify.randomeCode !== randomeCode);
    if (verify.randomeCode.toString() !== randomeCode.toString()) {
      return res.status(400).json({
        message: "Wrong otp",
      });
    }
    const user = await User.findOneAndUpdate({ email: email, authProvider: "google" }, { passWord: hash }, { new: true });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.json({
      success: true,  
      message: "Reset password",
    });
  } catch (error) {
    console.log(error);
  }
};

// render home page and verify token
// const verifyToken = (req, res) => {
//   try {
//     const { verifyToken } = req.body;
    
//     if (verifyToken) {

//       const verify = jwt.verify(verifyToken, process.env.Activation_sec);
//       if (!verify) {
//         return res.status(404).send({ message: "Token not valid" });
//       }
//       const token = jwt.sign({ _id: verify.user._id }, process.env.Jwt_sec, {
//         expiresIn: "5d",
//       });
      
//       return res.json({
//         success: true,
//         message: "verify success",
//         token,
//       });
//     }
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// };

// show profile for user
const showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id );
    res.json(user);
  } catch (error) {}
};

// function register from normal user become a seller
const registerShop = async (req, res) => {
  try {
    const {
      shopEmail,
      shopName,
      shopAddress,
      phoneNumber,
    } = req.body;

      const reg = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)*$/;
      const images = req.files.map((file) => file.path); 
      const isCheckEmail = reg.test(shopEmail);
      console.log(shopName, shopEmail, shopAddress, phoneNumber);
      
      if(!isCheckEmail){
          return res.status(400).send({ message: "Email is not valid" });
      }
      if (!shopName || !shopAddress || !phoneNumber ) {
          return res.status(400).send({ message: "The input is required" });
      }

      const register = new Shop({
          shopName,
          shopEmail,
          shopAddress,
          phoneNumber,
          images,
          isActive: false,
          isApproved: false,
          user: req.headers['id']
      });
      //  else if(!isCheckEmail){
      //       return res.status(400).send({ message: "Email is not valid" });
      //   }
      // const respone = await Shop.create({
      //     shopName: shopName, 
      //     shopEmail: isCheckEmail,
      //     shopAddress:shopAddress, 
      //     phoneNumber:phoneNumber,
      //     images: images,
      //     isActive: false,
      //     isApproved: false,
      //     user: req.headers['id']
      // });
      await register.save();
      res.status(201).json(register);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// add product to wishlist
const addWishlistProduct = async (req, res) => {
  try {
    // find product by id
    const product = await Product.findById(req.params.id);
    // check if product not found
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // find user by 
    const user = await User.findById(req.user._id );
    // check user if user not found
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // find wishlist product by product id and user id
    const wishlistProduct = await WishlistProduct.findOne({
      product: product._id,
      user: user._id,
    })
    // if wishlist product is existed return 
    if (wishlistProduct) {
      return res.status(400).send({ message: "Product already added to wishlist" });
    }

    // add wishlist product into database
    await WishlistProduct.create({
      product: product._id,
      user: user._id,
    })
    // respond with success message
    res.status(200).send({ message: "Product added to wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

// delete product from wishlist
const deleteWishlistProduct = async (req, res) => {
  try {
    // find wishlist product by id and delete it
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    const wishlistProduct = await WishlistProduct.findOneAndDelete({
      product: product._id,
      user: req.user._id ,
    })
    
    // check if wishlist not found
    if (!wishlistProduct ) {
      return res.status(404).send({ message: "Product does not exist in wishlist" });
    }

    // respond status with success message
    res.status(200).send({ message: "Product deleted from wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};


// update profile
const updateProfileUser = async (req, res) => {
  try {
    const updates = req.body;
    //check if password is provided
    if(updates.passWord){
      // hash password
      const hash = await bcrypt.hash(updates.passWord, 10);
      // update password
      updates.passWord = hash
    }
    // find user by id and update it
    const user = await User.findOneAndUpdate(req.user._id, updates, {
      new: true,
    });
    
    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const showDetailShop = async (req, res) => {
  try {
    // Tìm shop dựa trên user ID
    const shop = await Shop.findById(req.params.id );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Tìm 5 sản phẩm bán chạy nhất thuộc về shop này
    const products = await Product.find({ shopId: shop._id })
      .sort({ salesNumber: -1 }) // Sắp xếp giảm dần theo salesNumber
      .limit(10); // Giới hạn 10 sản phẩm
    console.log(products)
    // Trả về thông tin shop và danh sách sản phẩm best seller
    res.json({ shop, bestSellers: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const switchShop = async (req, res) => {
  try {
    const userId = req.user._id ; // Kiểm tra ID có được gửi đúng không
    const shop = await Shop.findOne({ user: userId }); // Truy vấn với user ID
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    if(shop.isActive === false || shop.isApproved === false){
      console.log(shop.isActive === false)
      return res.status(400).json({ message: "Shop not active" });
    }
    res.status(200).json({ message: "success", data: shop }); // Đảm bảo cấu trúc trả về là chính xác
  } catch (error) {
    console.error("Error in switchShop API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const createRole = async (req, res) => {
//   try {
//     const { name } = req.body; // Lấy thuộc tính "name" từ body
//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }

//     const result = await Role.create({ name });
//     res.status(201).json(result); // Trả về JSON kèm mã 201 (Created)
//   } catch (error) {
//     console.error(error); // Ghi log lỗi để debug
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {
  loadAuth,
  showProfile,
  registerShop,
  addPassword,
  addWishlistProduct,
  deleteWishlistProduct,
  forgotPassword,
  updateProfileUser,
  sendVerifyCode,
  showDetailShop,
  switchShop
};
