const Shop = require("../models/shop");
const Voucher = require("../models/voucher");

// Create voucher
const createVoucher = async (req, res) => {
  try {
    // Tìm shop dựa trên user._id
    const shop = await Shop.findOne({ user: req.user._id });
    const currentDate = new Date().setHours(0, 0, 0, 0);
    if (!shop) throw new Error("Shop not found");

    const { name, code, value, expired, valid } = req.body;
    let active = true;

    // Kiểm tra điều kiện đầu vào
    if (!name || !code || !value || !expired || !valid)
      throw new Error("Missing required fields");

    if (new Date(expired).getTime() < currentDate || new Date(valid).getTime() < currentDate)
      throw new Error("Expired date must be in the future");

    if (value <= 0) throw new Error("Value must be greater than 0");

    // Nếu valid lớn hơn ngày hiện tại, không kích hoạt voucher
    if (new Date(valid).getTime() > Date.now()) {
      active = false;
    }

    // Tạo voucher mới
    const newVoucher = new Voucher({
      name,
      code,
      value,
      validDate: valid,
      expired: expired,
      shopId: shop._id, 
      isActive: active,
    });

    await newVoucher.save(); // Lưu voucher vào database
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getValueVoucher = async (req, res) => {
  try {
   

    // Tìm voucher theo voucherId
    const voucher = await Voucher.findById(req.params.id); 
    if (!voucher) throw new Error("Voucher not found");

    // Trả về thông tin voucher bao gồm value
    res.status(200).json({ value: voucher.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllVoucher = async (req, res) => {
  try {
    const vouchers = await Voucher.find({isActive: true}).populate();
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// filter shop function
const filterShop = async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;

  try {
    // Chuyển page và limit về số nguyên
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Tìm kiếm với pagination
    const shops = await Shop.find({ shopName: name })
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua các phần tử của các trang trước
      .limit(limitNumber); // Giới hạn số lượng phần tử trong một trang

    // Đếm tổng số bản ghi
    const total = await Shop.countDocuments({ shopName: name });

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


module.exports = {
  createVoucher,
  filterShop,
  getValueVoucher,
  getAllVoucher
};