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
        if (!response) {
            return res.status(404).json({ message: "Shop not found" });
        }

        res.status(200).json(response);
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
      const user = await User.find().populate("role");
      res.json(user);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

module.exports = { approvedShop, showAllRegisterForm, showAllUser };