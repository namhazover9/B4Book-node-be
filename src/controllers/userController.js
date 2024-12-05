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
const { log } = require("console");
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
    const verifyCode = generateRandomCode(6);
    const user = await User.findOne({ email: email, authProvider: "google" });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const verify = jwt.sign({user, verifyCode}, process.env.Activation_sec, {expiresIn: "5m"});
    await sendMail(user.email, "VerifyToken", verifyCode);
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
const resetPassword = async (req, res) => {
  const { email, newPassword, verifyToken, verifyCode } = req.body;
  try {
    const verify = jwt.verify(verifyToken, process.env.Activation_sec);

    if (!verify) {
      return res.status(400).json({
        isAuth: false,
        message: "Code expired or invalid",
      });
    }
 
    if ((verify.verifyCode?.toString() !== verifyCode?.toString())) {
      return res.status(400).json({
        message: "Wrong OTP",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email: email },
      { passWord: hash },
      { new: true }
    );
    console.log(user);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Server error" });
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

// @desc    Add new address
// @route   POST /address/add
// @access  Private/Customer
const addAddress = async (req, res) => {
  try {
    const { street, city, country } = req.body;

    if (!street || !city || !country) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    // Tìm User hiện tại
    const user = await User.findById(req.user._id);
    if (!user) throw new Error("User not found");

    // Đặt tất cả địa chỉ hiện tại `isDefault` thành false
    user.address.forEach(address => {
      address.isDefault = false;
    });

    // Thêm địa chỉ mới với `isDefault: true`
    user.address.push({
      street,
      city,
      country,
      isDefault: true,
    });

    // Lưu lại User
    await user.save();

    res.status(201).json({ message: "Address added successfully", address: user.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit address
// @route   PUT /address/update/:id
// @access  Private/Customer
const updateAddress = async (req, res) => {
  try {
    const { street, city, country, isDefault } = req.body;
    const { id } = req.params; // Lấy addressId từ route parameters

    const user = await User.findById(req.user._id);
    if (!user) throw new Error("User not found");

    // Tìm địa chỉ cần cập nhật
    const address = user.address.id(id);
    if (!address) throw new Error("Address not found");

    // Cập nhật thông tin địa chỉ
    if (street) address.street = street;
    if (city) address.city = city;
    if (country) address.country = country;

    // Nếu `isDefault: true`, cập nhật tất cả các địa chỉ khác thành `false`
    if (isDefault === true) {
      user.address.forEach(addr => (addr.isDefault = false));
      address.isDefault = true;
    }

    await user.save();

    res.status(200).json({ message: "Address updated successfully", addresses: user.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /address/delete/:id
// @access  Private/Customer
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params; // Lấy addressId từ route parameters

    const user = await User.findById(req.user._id);
    if (!user) throw new Error("User not found");

    // Tìm và xóa địa chỉ trong mảng
    const addressIndex = user.address.findIndex(address => address._id.toString() === id);
    if (addressIndex === -1) throw new Error("Address not found");

    user.address.splice(addressIndex, 1); // Xóa địa chỉ

    // Nếu địa chỉ vừa xóa là mặc định và vẫn còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
    if (user.address.length > 0 && user.address.every(addr => addr.isDefault === false)) {
      user.address[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ message: "Address deleted successfully", addresses: user.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// function register from normal user become a seller
const registerShop = async (req, res) => {
  try {
    const {
      shopEmail,
      shopName,
      address,
      phoneNumber,
    } = req.body;

      const reg = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)*$/;
      const images = req.files.map((file) => file.path); 
      const isCheckEmail = reg.test(shopEmail);
      console.log(shopName, shopEmail, address, phoneNumber);
      
      if(!isCheckEmail){
          return res.status(400).send({ message: "Email is not valid" });
      }
      if (!shopName || !address || !phoneNumber ) {
          return res.status(400).send({ message: "The input is required" });
      }

      const register = new Shop({
          shopName,
          shopEmail,
          address,
          phoneNumber,
          images,
          isActive: false,
          isApproved: false,
          wallet: 0,
          user: req.user._id 
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
    const wishlistProduct = await WishlistProduct.findByIdAndDelete(req.params.id);
    if (!wishlistProduct ) {
      return res.status(404).send({ message: "Product does not exist in wishlist" });
    }
    res.status(200).send({ message: "Product deleted from wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};


const getAllWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
    const limit = parseInt(req.query.limit) || 10; // Số mục mỗi trang (mặc định là 10)
    const skip = (page - 1) * limit; // Số mục cần bỏ qua
    
    // Lấy danh sách wishlist của user
    const wishlist = await WishlistProduct.find({ user: userId })
      .populate({
        path: "product",
        model: "Product",
        select: "title description price images author publisher stock category",
      });

    // Kiểm tra nếu danh sách rỗng
    if (!wishlist || wishlist.length === 0) {
      return res.status(200).json({
        status: 'success',
        currentPage: page,
        totalPages: 0,
        numOfWishlistItems: 0,
        totalWishlistItems: 0,
        data: [], // Trả về mảng trống
      });
    }

    // Paginate danh sách wishlist
    const paginatedWishlistItems = wishlist.slice(skip, skip + limit);

    res.status(200).json({
      status: 'success',
      currentPage: page,
      totalPages: Math.ceil(wishlist.length / limit),
      numOfWishlistItems: paginatedWishlistItems.length,
      totalWishlistItems: wishlist.length,
      data: paginatedWishlistItems,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};



// update profile
const updateProfileUser = async (req, res) => {
  try {
    const {email,userName, phoneNumber} = req.body;
    // Tìm user và cập nhật
    const user = await User.findOneAndUpdate(req.user._id, {email:email, userName:userName, phoneNumber:phoneNumber}, {
      new: true,
    });

    if (!user) throw new Error("User not found");
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
  resetPassword,
  updateProfileUser,
  addAddress,
  updateAddress,
  deleteAddress,
  sendVerifyCode,
  showDetailShop,
  switchShop,
  getAllWishList
};
