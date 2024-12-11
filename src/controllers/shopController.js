const { generateRandomCode } = require("../middlewares/generateCode");
const Shop = require("../models/shop");
const Voucher = require("../models/voucher");
const WithdrawRequest = require("../models/withdrawRequest");

// Create voucher
const createVoucher = async (req, res) => {

  try {
    // find shop base on user._id
    const shop = await Shop.findById(req.user._id);
    if (!shop) throw new Error("Shop not found");
   
    // create current date to compare with valid date and expired date
    const currentDate = new Date().setHours(0, 0, 0, 0);
  
   

    // input voucher from user
    const { name, value, expired, valid } = req.body;
    const image = req.files.map((file) => file.path);
    let active = true;
    let code = generateRandomCode(20);

    // check conditions input
    if (!name || !value || !expired || !valid)
      throw new Error("Missing required fields");

    if (new Date(expired).getTime() < currentDate || new Date(valid).getTime() < currentDate)
      throw new Error("Expired date must be in the future");

    if (value <= 0) throw new Error("Value must be greater than 0");

    // if valid date is in the future, set active to false
    if (new Date(valid).getTime() > Date.now()) {
      active = false;
    }

    // Create new voucher 
    const newVoucher = await Voucher.create({
      name,
      code: code,
      value,
      validDate: valid,
      expired: expired,
      shopId: shop._id, 
      isActive: active,
      isDeleted: false,
      image: image,
    });
    res.status(200).json(newVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get value voucher function
const getValueVoucher = async (req, res) => {
  try {
  
    // find voucherId
    const voucher = await Voucher.findById(req.params.id); 
    if (!voucher) throw new Error("Voucher not found");

    //return voucher's value 
    res.status(200).json({ value: voucher.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all voucher function
const getAllVoucher = async (req, res) => {
  try {
    const vouchers = await Voucher.find({isActive: true},{isDeleted: false});
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllVoucherForShop = async (req, res) => {
  try {
    const { id } = req.params; // Lấy shopId từ params
    const { sort } = req.query; // Lấy sort từ query string

    // Ánh xạ các giá trị từ dropdown đến các điều kiện lọc
    const filterConditions = {
      'All Vouchers': { shopId: id }, // Lấy tất cả voucher của shop
      'Active': { shopId: id, isActive: true }, // Voucher đang hoạt động
      'Deactive': { shopId: id, isActive: false }, // Voucher không hoạt động
      'No delete': { shopId: id, isDeleted: false }, // Voucher chưa bị xóa
      'Deleted': { shopId: id, isDeleted: true }, // Voucher đã bị xóa
    };

    // Lấy điều kiện lọc từ filterConditions, mặc định là 'All Vouchers'
    const filterCondition = filterConditions[sort] || filterConditions['All Vouchers'];

    // Tìm voucher dựa trên điều kiện lọc
    const vouchers = await Voucher.find(filterCondition);

    res.status(200).json(vouchers); // Trả về danh sách vouchers
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// active or deactive vouchers
const activeOrDeactiveVoucher = async (req, res) => {
  try {
    // create current date to compare with valid date and expired date
    const currentDate = new Date().setHours(0, 0, 0, 0);

    // activate vouchers are valid
    await Voucher.updateMany(
      { validDate: { $lte: currentDate }, expired: { $gte: currentDate } },
      { isActive: true }
    );

    // Deactivate vouchers is expired
    await Voucher.updateMany(
      { expired: { $lt: currentDate } },
      { isActive: false }
    );

    // take all vouchers active
    const vouchersActive = await Voucher.find({
      isActive: true,
      expired: { $gte: currentDate },
    });

    // take all vouchers deactive
    const voucherUnActive = await Voucher.find({
      isActive: false,
      expired: { $lt: currentDate },
    });

    res.status(200).json({ vouchersActive, voucherUnActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete voucher
const deleteVoucher = async (req, res) => {
  try {
    // find voucher by id and update it, set isDeleted to true
    const voucher = await Voucher.findByIdAndUpdate(req.params.id,{isDeleted: true, isActive: false},{new: true});
    if (!voucher) throw new Error("Voucher not found");
    res.status(200).json({ message: "Voucher deleted successfully" });;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update voucher 
const updateVoucher = async (req, res) => {
  try {
    // Extract image files if provided
    const image = req.files?.map((file) => file.path);

    // Extract fields to update from req.body
    const { name, value, valid, expired, isActive } = req.body;
    // Build update object
    const updateFields = {
      ...(name && { name }),
      ...(value && { value }),
      ...(valid && { valid }),
      ...(expired && { expired }),
      ...(isActive !== undefined && { isActive }),
    };

    // Include images if provided
    if (image && image.length > 0) {
      updateFields.image = image;
    }

    // Find voucher by id and update it
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, updateFields, {
      new: true, // Return the updated document
    });
    
    if (!voucher) throw new Error("Voucher not found");

    res.status(200).json({ message: "Voucher updated successfully", voucher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchVoucherForShop = async (req, res) => {
  try {
    const { name,shop } = req.query;
   if(shop){
    const shopId = await Shop.findOne({ _id: shop });
    if (!shopId) throw new Error("Shop not found");
    const vouchers = await Voucher.find({ shopId: shopId._id,name: { $regex: name, $options: 'i' } });
    res.status(200).json(vouchers);
   }
   else{
    const vouchers = await Voucher.find({ name: { $regex: name, $options: 'i' } });
    res.status(200).json(vouchers);
   }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// filter shop function
const getAllShop = async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;

  try {
    // Chuyển page và limit về số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Điều kiện tìm kiếm: nếu có `name`, tìm theo `shopName`, nếu không, lấy tất cả
    const query = {
      isActive: true,
      isApproved: true,
      ...(name && { shopName: { $regex: name, $options: 'i' } }) // Nếu có `name`, tìm theo `shopName`
    };

    // Tìm kiếm với pagination
    const shops = await Shop.find(query)
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua các phần tử của các trang trước
      .limit(limitNumber); // Giới hạn số lượng phần tử trong một trang

    // Đếm tổng số bản ghi
    const total = await Shop.countDocuments(query);

    res.status(200).json({
      data: shops,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber), // Tính tổng số trang
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTotalShop = async (req, res) => {
  try {
    const totalShop = await Shop.countDocuments();
    res.status(200).json({ totalShop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const searchShop = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Kiểm tra nếu keyword không tồn tại hoặc không phải là chuỗi
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ message: "Keyword must be a non-empty string" });
    }

    // Tìm kiếm sản phẩm
    const products = await Shop.find({
      $or: [
        { shopName: { $regex: keyword, $options: "i" } },
      ],
    });

    // Trả về danh sách sản phẩm
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

    // Tìm Shop hiện tại
    const shop = await Shop.findById(req.user._id);
    if (!shop) throw new Error("Shop not found");

    // Đặt tất cả địa chỉ hiện tại `isDefault` thành false
    shop.address.forEach(address => {
      address.isDefault = false;
    });

    // Thêm địa chỉ mới với `isDefault: true`
    shop.address.push({
      street,
      city,
      country,
      isDefault: true,
    });

  
    await shop.save();

    res.status(201).json({ message: "Address added successfully", address: shop.address });
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

    const shop = await Shop.findById(req.user._id);
    if (!shop) throw new Error("shop not found");

    // Tìm địa chỉ cần cập nhật
    const address = shop.address.id(id);
    if (!address) throw new Error("Address not found");

    // Cập nhật thông tin địa chỉ
    if (street) address.street = street;
    if (city) address.city = city;
    if (country) address.country = country;

    // Nếu `isDefault: true`, cập nhật tất cả các địa chỉ khác thành `false`
    if (isDefault === true) {
      shop.address.forEach(addr => (addr.isDefault = false));
      address.isDefault = true;
    }

    await shop.save();

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

    const shop = await Shop.findById(req.user._id);
    if (!shop) throw new Error("User not found");

    // Tìm và xóa địa chỉ trong mảng
    const addressIndex = shop.address.findIndex(address => address._id.toString() === id);
    if (addressIndex === -1) throw new Error("Address not found");

    shop.address.splice(addressIndex, 1); // Xóa địa chỉ

    // Nếu địa chỉ vừa xóa là mặc định và vẫn còn địa chỉ khác, đặt địa chỉ đầu tiên làm mặc định
    if (shop.address.length > 0 && shop.address.every(addr => addr.isDefault === false)) {
      shop.address[0].isDefault = true;
    }

    await shop.save();

    res.status(200).json({ message: "Address deleted successfully", addresses: shop.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const showShopInfo = async (req, res) => {
  try {
      const user = req.user._id; // Kiểm tra thông tin user
      const shop = await Shop.findById(user);
      if (!shop) {
          return res.status(404).send({ message: "Shop not found" });
      }
      res.status(200).json(shop);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// @desc    Update shop information
// @route   PUT /shop/update
// @access  Private/Shop
const updateShopInfo = async (req, res) => {
  try {
    const {
      shopEmail,
      shopName,
      phoneNumber,
    } = req.body;

    const images = req.files?.map((file) => file.path) || []; // Lấy URL nếu có file mới

    const shop = await Shop.findById(req.user._id);
    if (!shop) {
      return res.status(404).send({ message: "Shop not found" });
    }

    // Cập nhật các trường
    shop.shopEmail = shopEmail || shop.shopEmail;
    shop.shopName = shopName || shop.shopName;
    shop.phoneNumber = phoneNumber || shop.phoneNumber;
    shop.images = images || shop.images;

    // Thêm hình ảnh mới nếu có
    // if (images.length > 0) {
    //   shop.images.push(...images);
    // }

    await shop.save();
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const switchCustomer = async (req, res) => {
  try {
    const userId = req.user._id ; // Kiểm tra ID có được gửi đúng không
    const shop = await Shop.findOne({ user: userId }); // Truy vấn với user ID
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.status(200).json({ message: "success", data: shop }); // Đảm bảo cấu trúc trả về là chính xác
  } catch (error) {
    console.error("Error in switchShop API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------Withdraw Request------------------------

const createWithdrawRequest = async (req, res) => {
  const { amount } = req.body; // Lấy số tiền từ body

  try {
    // Tìm Shop dựa trên userId
    const shop = await Shop.findById(req.user._id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Kiểm tra số dư ví
    if (shop.wallet < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Tạo yêu cầu rút tiền
    const withdrawRequest = new WithdrawRequest({
      shop: shop._id,
      amount,
    });

    await withdrawRequest.save();

    // Trừ số tiền tạm thời
    shop.wallet -= amount;
    await shop.save();

    res.status(201).json({ message: "Withdraw request created", withdrawRequest });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getWithdrawsByShopId = async (req, res) => {
  try {
    // Lấy shopId từ thông tin user đã đăng nhập
    const userId = req.user._id;
    const shop = await Shop.findOne({ _id: userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Lấy tất cả yêu cầu rút tiền của Shop
    const withdrawRequests = await WithdrawRequest.find({ shop: shop._id })
      .populate("shop", "shopName shopEmail phoneNumber") // Thêm thông tin Shop
      .sort({ createdAt: -1 });

    res.status(200).json({ withdrawRequests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const searchWithdrawal = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    console.log("Search keyword:", keyword);

    // Tìm order và lọc các user phù hợp bằng match
    const withdrawals = await WithdrawRequest.find().populate({
      path: "shop",
      select: "shopName shopEmail phoneNumber",
      match: {
        $or: [
          { shopName: { $regex: keyword, $options: "i" } },
          { shopEmail: { $regex: keyword, $options: "i" } },
          { phoneNumber: { $regex: keyword, $options: "i" } },
        ],
      },
    });

    // Lọc ra các orders có customer phù hợp
    const filteredWithdrawals = withdrawals.filter(withdrawal => withdrawal.shop);

    console.log("Filtered withdrawals:", filteredWithdrawals);

    if (filteredWithdrawals.length === 0) {
      return res.status(404).json({ message: "No withdrawals found." });
    }

    // Định dạng lại dữ liệu để trả về giống với getAllOrderByShop
    const formattedWithdrawal = filteredWithdrawals.map((withdrawal, index) => ({
      key: index + 1,
      id: withdrawal._id,
      name: withdrawal.shop?.shopName || 'Unknown',
      email: withdrawal.shop?.shopEmail || 'N/A',
      phoneNumber: withdrawal.shop?.phoneNumber || 'N/A',
      status: withdrawal.status || 'Unknown',
      amount: `$${withdrawal.amount || 0}`,
    }));

    res.status(200).json({ success: true, withdrawals: formattedWithdrawal });
  } catch (error) {
    console.error("Error searching withdrawals:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

const getAllTotalRevenueForMonth = async (req, res) => {
  try {
    // Lấy ngày hiện tại và định dạng thành 'YYYY-MM'
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`;

    const shops = await Shop.find({});
    const totalRevenue = shops.reduce((acc, shop) => {
      const revenue = shop.revenue.find((r) => r.month === currentYearMonth);
      return acc + (revenue ? revenue.amount : 0);
    }, 0);

    res.status(200).json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const shops = await Shop.find({});
    const monthlyRevenue = Array(12).fill(0);
    const monthlyRevenue5Percent = Array(12).fill(0);

    shops.forEach(shop => {
      shop.revenue.forEach(revenue => {
        const monthIndex = new Date(revenue.month).getMonth();
        monthlyRevenue[monthIndex] += revenue.amount;
        monthlyRevenue5Percent[monthIndex] += revenue.amount * 0.05;
      });
    });

    const adjustedMonthlyRevenue = monthlyRevenue.map((amount, index) => parseFloat((amount - monthlyRevenue5Percent[index]).toFixed(2)));
    const roundedMonthlyRevenue5Percent = monthlyRevenue5Percent.map(amount => parseFloat(amount.toFixed(2)));

    res.status(200).json({ monthlyRevenue: adjustedMonthlyRevenue, monthlyRevenue5Percent: roundedMonthlyRevenue5Percent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createVoucher,
  getValueVoucher,
  getAllVoucher,
  activeOrDeactiveVoucher,
  deleteVoucher,
  updateVoucher,
  searchShop,
  getAllShop,
  addAddress,
  updateAddress,
  deleteAddress,
  updateShopInfo,
  switchCustomer,
  createWithdrawRequest,
  getWithdrawsByShopId,
  searchWithdrawal,
  getAllVoucherForShop,
  searchVoucherForShop,
  getTotalShop,
  getAllTotalRevenueForMonth,
  getMonthlyRevenue,
  showShopInfo
};