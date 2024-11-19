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
        const users = await User.find().populate({
            path: "role", 
            select: "name",
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { approvedShop, showAllRegisterForm, showAllUser };