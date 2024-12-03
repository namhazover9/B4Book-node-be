const Role = require("../models/role");
const Shop = require("../models/shop");
const User = require("../models/user");
const WithdrawRequest = require("../models/withdrawRequest");

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
  const { page = 1, limit = 10 } = req.query;

  try {
      // Chuyển đổi page và limit sang kiểu số
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Tính số lượng bản ghi cần bỏ qua
      const skip = (pageNumber - 1) * limitNumber;

      // Tìm các shop chưa được phê duyệt với pagination
      const shops = await Shop.find({ isApproved: false })
          .skip(skip)
          .limit(limitNumber);

      // Đếm tổng số bản ghi chưa được phê duyệt
      const total = await Shop.countDocuments({ isApproved: false });

      res.status(200).json({
          data: shops,
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalItems: total,
      });
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
};


// Show all user and filter by role
const showAllUser = async (req, res) => {
  try {
    const { role, status } = req.query; // Lấy role và status từ query params

    // Check role Customer
    if (role === "Customer") {
      const roleCustomer = await Role.findOne({ name: "Customer" });
      const customers = await User.find({
        role: roleCustomer._id, // Chỉ lấy các user có role là "Customer"
        ...(status !== undefined && { isActive: status === "true" }) // Lọc theo status nếu có
      }).populate({
        path: "role", // Populate mảng role
        select: "name", // Chỉ lấy trường name của role
      });

      const total = await User.countDocuments({
        role: roleCustomer._id,
        ...(status !== undefined && { isActive: status === "true" }),
      });

      return res.status(200).json({
        total,
        customers,
      });
    }

    // Check role Shop
    if (role === "Shop") {
      const shops = await Shop.find({
        ...(status !== undefined && { isActive: status === "true" }), // Lọc theo status nếu có
      });

      const total = await Shop.countDocuments({
        ...(status !== undefined && { isActive: status === "true" }),
      });

      return res.status(200).json({
        total,
        shops,
      });
    }

    // Nếu người dùng muốn hiển thị tất cả user (không phải Admin)
    const roleCustomer = await Role.findOne({ name: "Customer" });
    const roleShop = await Role.findOne({ name: "Shop" });

    const users = await User.find({
      role: { $in: [roleCustomer._id, roleShop._id] }, // Chỉ lấy user có role là "Customer" hoặc "Shop"
      ...(status !== undefined && { isActive: status === "true" }), // Lọc theo status nếu có
    }).populate({
      path: "role",
      select: "name", // Lấy tên role thay vì ID
    });

    const total = await User.countDocuments({
      role: { $in: [roleCustomer._id, roleShop._id] },
      ...(status !== undefined && { isActive: status === "true" }),
    });

    return res.status(200).json({
      total,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};


// active or deactive account
const activeOrDeactive = async (req, res) => {
  try {
    const { id, status } = req.query;
    console.log(id, status);
    // Cập nhật trạng thái của user
    const customer = await User.findByIdAndUpdate(
      id,
      { isActive: status }, // Cập nhật trạng thái khóa/unlock
      { new: true }
    );

    if (!customer) {
      const shop = await Shop.findByIdAndUpdate(
        id,
        { isActive: status }, // Cập nhật trạng thái khóa/unlock
        { new: true }
      );
      
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      // Đảm bảo chỉ trả về một lần phản hồi
      return res.status(200).json({ message: "Success", success: true });
    }

    // Đảm bảo chỉ trả về một lần phản hồi
    return res.status(200).json({ message: "Success", success: true });

  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).send({ message: error.message });
  }
};

const searchAccount = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Tìm kiếm trong cả User và Shop
    const users = await User.find({
      $or: [
        { userName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
      ],
    });

    const shops = await Shop.find({
      $or: [
        { shopName: { $regex: keyword, $options: "i" } },
        { shopEmail: { $regex: keyword, $options: "i" } },
        { shopPhoneNumber: { $regex: keyword, $options: "i" } },
      ],
    });

    // Kết hợp kết quả của User và Shop
    return res.status(200).json({ users, shops });
  } catch (error) {
    console.error('Error searching users and shops:', error);
    return res.status(500).send({ message: error.message });
  }
};



// --------------------Withdraw Request--------------------

const getAllWithdraws = async (req, res) => {
  try {
    // Lấy tất cả yêu cầu rút tiền và thông tin Shop liên quan
    const withdrawRequests = await WithdrawRequest.find()
      .populate("shop", "shopName shopEmail") // Lấy các thuộc tính cần thiết từ Shop
      .sort({ createdAt: -1 }); // Sắp xếp từ mới nhất đến cũ nhất

    res.status(200).json({ withdrawRequests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getWithdrawById = async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm yêu cầu rút tiền theo requestId
    const withdrawRequest = await WithdrawRequest.findById(id).populate(
      "shop",
      "shopName shopEmail"
    );

    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    res.status(200).json({ withdrawRequest });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


// const updateWithdrawRequest = async (req, res) => {
//   const { requestId, status } = req.body;

//   try {
//     // Tìm yêu cầu rút tiền
//     const withdrawRequest = await WithdrawRequest.findById(requestId).populate("shop");
//     if (!withdrawRequest) {
//       return res.status(404).json({ message: "Withdraw request not found" });
//     }

//     // Kiểm tra trạng thái hiện tại
//     if (withdrawRequest.status !== "Pending") {
//       return res.status(400).json({ message: "Request has already been processed" });
//     }

//     // Cập nhật trạng thái
//     withdrawRequest.status = status;
//     withdrawRequest.processedAt = new Date();

//     // Nếu yêu cầu bị từ chối, hoàn lại tiền vào ví Shop
//     if (status === "Rejected") {
//       const shop = withdrawRequest.shop;
//       if (!shop) {
//         return res.status(404).json({ message: "Associated shop not found" });
//       }

//       shop.wallet += withdrawRequest.amount;
//       await shop.save();
//     }

//     await withdrawRequest.save();

//     res.status(200).json({ message: "Withdraw request updated successfully", withdrawRequest });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };


module.exports = { 
  approvedShop,
  showAllRegisterForm,
  showAllUser,
  activeOrDeactive,
  updateWithdrawRequest,
  searchAccount,
  getAllWithdraws,
  getWithdrawById
};