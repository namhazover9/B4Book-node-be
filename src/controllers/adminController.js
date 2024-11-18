const Inventory = require("../models/inventory");
const Shop = require("../models/shop");

const approvedShop = async (req, res) => {
    try {
        const { id } = req.params;

        // Cập nhật `isApproved` và `isActive` thành true
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


const showAllRegisterForm = async (req, res) => {
    try {
        const respone = await Shop.find({ isApproved: false });
        res.status(200).json(respone);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports = { approvedShop, showAllRegisterForm };