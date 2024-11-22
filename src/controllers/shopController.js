const Shop = require("../models/shop");
const Voucher = require("../models/voucher");
const createVoucher = async (req, res) => {
    const shopId = await Shop.findOne({ user: req.user._id });
    const { name, code, value, expired, valid } = req.body;
    try {
      if(!name || !code || !value || !expired || !valid || !shopId) throw new Error("Missing required fields");
      const newVoucher = await Voucher({
        name: name,
        code: code,
        value: value,
        validDate: valid,
        expired: expired,
        shopId: shopId,
      });
      res.status(201).json(newVoucher);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

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
};