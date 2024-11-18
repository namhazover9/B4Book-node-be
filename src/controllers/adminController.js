const approvedShop = async (req, res) => {
    try {
        const { id } = req.params;
        const respone = await Shop.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        res.status(200).json(respone);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

const showAllRegisterForm = async (req, res) => {
    try {
        const respone = await Shop.find({ isApproved: false });
        res.status(200).json(respone);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports = { approvedShop, showAllRegisterForm };