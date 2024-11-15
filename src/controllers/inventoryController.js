const Inventory = require("../models/inventory");

exports.createInventory = async (req, res) => {
  try {
    const { shop } = req.body;
    const inventory = new Inventory({ shop });
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
