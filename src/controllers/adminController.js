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

// Show all user and filter by role
const showAllUser = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query; // Default: page 1, 10 items per page
    const skip = (page - 1) * limit; // Calculate how many documents to skip
    
    // check role Customer
    if (role === "Customer") {
      const roleDoc = await Role.findOne({ name: role });
      const customers = await User.find({ 
        isActive: status, 
        role: { $elemMatch: { $eq: roleDoc._id } } 
      })
        .skip(skip)
        .limit(parseInt(limit)); // Apply pagination
      const total = await User.countDocuments({ 
        isActive: status, 
        role: { $elemMatch: { $eq: roleDoc._id } } 
      }); // Total documents count
      res.status(200).json({ 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        customers 
      });
    } 

    // check role Shop
    else if (role === "Shop") {
      const roleDoc = await Role.findOne({ name: role });
      const shops = await User.find({ 
        isActive: status, 
        role: { $elemMatch: { $eq: roleDoc._id } } 
      })
        .skip(skip)
        .limit(parseInt(limit)); // Apply pagination
      const total = await User.countDocuments({ 
        isActive: status, 
        role: { $elemMatch: { $eq: roleDoc._id } } 
      }); // Total documents count
      res.status(200).json({ 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        shops 
      });
    } 
    // if user want to display all user
    else {
      const users = await User.find()
        .skip(skip)
        .limit(parseInt(limit)); // Apply pagination
      const total = await User.countDocuments(); // Total documents count
      res.status(200).json({ 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        users 
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// active or deactive account
const activeOrDeactive = async (req, res) => {
  try {
    const { id, status,role } = req.query;
   if (role === "Customer") {
    const response = await User.findByIdAndUpdate(
      id,
      { isActive: status },
      { new: true }
    );
    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({message: "Success", success: true});
  }
  
  else if (role === "Shop") {
    const response = await Shop.findByIdAndUpdate(
      id,
      { isActive: status },
      { new: true }
    );
    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({message: "Success", success: true});
  }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

module.exports = { approvedShop, showAllRegisterForm, showAllUser, activeOrDeactive };