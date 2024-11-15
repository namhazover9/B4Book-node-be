const Category = require("../models/category");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).send("Category not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// exports.getAllCategoriesByName = async (req, res) => {
//   console.log("111")
//   try {
//     const titleQuery = req.query.name;
//     if (!titleQuery) {
//       return res.status(400).send({ message: "Name query is required" });
//     }

//     // Tìm kiếm các sản phẩm có title bắt đầu bằng titleQuery, không phân biệt hoa thường
//     const categories = await Category.find({ 
//       name: { $regex: new RegExp("^" + titleQuery, "i") } 
//     });

//     if (categories.length > 0) {
//       res.json(categories);
//     } else {
//       res.status(404).send({ message: "No categories found" });
//     }
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// };

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (category) {
      res.json(category);
    } else {
      res.status(404).send("Category not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (category) {
      res.status(204).send();
    } else {
      res.status(404).send("Category not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

