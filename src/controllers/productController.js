const Product = require("../models/product");
// const Category = require("../models/category");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      public_date,
      language,
      stock,
      isApproved,
      isDeleted,
    } = req.body;

    const product = new Product({
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      public_date,
      language,
      stock,
      isApproved,
      isDeleted,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      public_date,
      language,
      stock,
      isApproved,
      isDeleted,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        price,
        author,
        publisher,
        description,
        ISBN,
        public_date,
        language,
        stock,
        isApproved,
        isDeleted,
      },
      { new: true }
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isDeleted = true;
    await product.save();

    req.flash("success", "Product deleted successfully");
    return res.redirect("/products"); // Đổi URL đến trang phù hợp
  } catch (error) {
    console.error("Error during soft delete:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.ratingProduct = async (req, res) => {
  try {
    const { ratting } = req.body; 
    const productId = req.params.id; 

    
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { numberOfRating: 1, rating: ratting }, 
      },
      { new: true } 
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Ratting updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating ratting",
      error: error.message,
    });
  }
};

exports.showRating = async (req, res) => {
  try {
    const productId = req.params.id; 
    const product = await Product.findById(productId);
    const resultRating = product.rating / product.numberOfRating;
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(resultRating);
  } catch (error) {
    
  }
}
