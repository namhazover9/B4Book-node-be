const Role = require("../models/role");
const Shop = require("../models/shop");
const User = require("../models/user");
// function approve register form become a seller from user
const approvedShop = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await Shop.findByIdAndUpdate(
            id, 
            { 
                isApproved: true, 
                isActive: true 
            }, 
            { new: true } 
        );
        console.log("res",response);
        if (!response) {
            return res.status(404).json({ message: "Shop not found" });
        }

        const roleId = await Role.findOne({ name: "Shop" });
        if (!roleId) {
            return res.status(404).json({ message: "Role not found" });
        }
        console.log("roleid",roleId)
        const user = await User.findByIdAndUpdate(
            response.user, 
            { $addToSet: { role: roleId._id } }, 
            { new: true }
        );
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ shop: response, user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// function show all register form
const showAllRegisterForm = async (req, res) => {
    try {
        const respone = await Shop.find({ isApproved: false });
        res.status(200).json(respone);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}
// Show all user for admin
const showAllUser = async (req, res) => {
  try {
    const {role1, role2} = req.query;
    // Lấy tất cả các role có tên là "Customer" và "Shop"
    const roles = await Role.find({
      name: { $in: [role1, role2] }
    });

    // Lấy các role _id từ kết quả
    const roleIds = roles.map(role => role._id);

    // Lọc tất cả người dùng có role là Customer hoặc Shop
    const users = await User.find({ role: { $in: roleIds } });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const showShop = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
  
      // Chuyển page và limit về số nguyên
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
  
      // Tìm kiếm các shop bị khóa với pagination
      const shops = await Shop.find({ isActive: status })
        .skip((pageNumber - 1) * limitNumber) // Bỏ qua các phần tử của các trang trước
        .limit(limitNumber); // Giới hạn số lượng phần tử trong một trang

      // Đếm tổng số shop bị khóa
      const total = await Shop.countDocuments({ isActive: false });
  
      // Trả về kết quả
      res.status(200).json({
        data: shops,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber), // Tổng số trang
        totalItems: total,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };


  const showCustomer = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
    const role = await Role.findOne({ name: "Customer" });

      // Chuyển page và limit về số nguyên
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
  
      // Tìm kiếm các customer với pagination
      const shops = await User.find({ isActive: status ,role: { $elemMatch: { $eq: role._id } }, })
      
        .skip((pageNumber - 1) * limitNumber) // Bỏ qua các phần tử của các trang trước
        .limit(limitNumber); // Giới hạn số lượng phần tử trong một trang

      // Đếm tổng số User 
      const total = await User.countDocuments({ isActive: status,role: { $elemMatch: { $eq: role._id } } });
  
      // Trả về kết quả
      res.status(200).json({
        data: shops,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber), // Tổng số trang
        totalItems: total,
        
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };


module.exports = { approvedShop, showAllRegisterForm, showAllUser, showShop,showCustomer };