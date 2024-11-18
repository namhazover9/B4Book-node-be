const Shop = require("../models/shop");

const registerShop = async (req, res) => {
    try {
        const { shopName, shopEmail, shopAddress, phoneNumber, avartar } = req.body;
        const reg = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)*$/;
        const isCheckEmail = reg.test(shopEmail);
        if (!shopEmail || !shopName || !shopAddress || !phoneNumber || !avartar ) {
            return res.status(400).send({ message: "The input is required" });
        }
       else if(!isCheckEmail){
            return res.status(400).send({ message: "Email is not valid" });
        }
        const respone = await Shop.create({
            shopName: shopName, 
            shopEmail: shopEmail,
            shopAddress:shopAddress, 
            phoneNumber:phoneNumber,
            avartar:avartar,
            isActive: false,
            isApproved: false,
            user: req.user._id
        });
        res.status(200).json(respone);
    } catch (error) {
        
    }
};