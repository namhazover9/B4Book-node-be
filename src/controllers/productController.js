const Product = require("../models/product");
// const Category = require("../models/category");
const cloudinary = require("../utils/cloudinary");
const ExcelJS = require('exceljs');


exports.uploadImages = async (req, res) => {
  try {
    const files = req.files; // Các file từ Multer
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }
    const imageUrls = files.map((file) => file.path); // URL trả về từ Cloudinary

    res.status(200).json({ message: "Images uploaded successfully", imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove image from Cloudinary
// @route   DELETE /:id/remove-image
// @access  Private/Shop
exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body; // URL của hình ảnh cần xóa

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // Lấy public_id từ URL
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Xóa hình ảnh trên Cloudinary
    await cloudinary.uploader.destroy(`products/${publicId}`);

    // Xóa URL khỏi mảng images
    product.images = product.images.filter((url) => url !== imageUrl);
    await product.save();

    res.status(200).json({ message: "Image removed successfully", product });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// @desc    Get product by ID
// @route   GET /:id
// @access  Public/User
exports.getProductById = async (req, res) => {
  try {
    // Tìm và tăng countClick lên 1
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { countClick: 1 } }, // Sử dụng $inc để tăng giá trị trường countClick
      { new: true } // Tùy chọn này trả về bản ghi đã được cập nhật
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


// @desc    Create a new product
// @route   POST /create
// @access  Private/Shop

exports.getProductByShop = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Mặc định: page = 1, limit = 10
    const shopId = req.params.id;
    // Chuyển đổi `page` và `limit` sang kiểu số
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Tìm sản phẩm với shopId
    const products = await Product.find({ shopId, isDeleted: false })
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua (page-1) * limit sản phẩm
      .limit(limitNumber); // Lấy số lượng sản phẩm tương ứng với limit
    // Đếm tổng số sản phẩm để trả về thông tin tổng số trang
    const totalProducts = await Product.countDocuments({ shopId });

    res.json({
      status: 'success',
      data: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        products,  // trả về mảng sản phẩm
      },
    });
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
      language,
      stock,
    } = req.body;

    const images = req.files.map((file) => file.path); // Lấy URL từ Cloudinary
    const shopId = req.user._id
    console.log(shopId)
    const product = new Product({
      title,
      category,
      price,
      author,
      publisher,
      description,
      ISBN,
      language,
      stock,
      images,
      shopId
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /:id
// @access  Private/Shop
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
      language,
      stock,
      isApproved,
      isDeleted,
    } = req.body;

    const images = req.files?.map((file) => file.path) || []; // Lấy URL nếu có file mới

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    // Cập nhật các trường
    product.title = title || product.title;
    product.category = category || product.category;
    product.price = price || product.price;
    product.author = author || product.author;
    product.publisher = publisher || product.publisher;
    product.description = description || product.description;
    product.ISBN = ISBN || product.ISBN;
    product.language = language || product.language;
    product.stock = stock || product.stock;
    product.isApproved = isApproved || product.isApproved;
    product.isDeleted = isDeleted || product.isDeleted;

    // Thêm hình ảnh mới nếu có
    if (images.length > 0) {
      product.images.push(...images);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /:id
// @access  Private/Shop
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
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

    return res.status(200).json({ message: "Delete product successfully" }); // Đổi URL đến trang phù hợp
  } catch (error) {
    console.error("Error during soft delete:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.feebackProduct = async (req, res) => {
  try {
    const { rating, comment } = req.body; 
    const productId = req.params.id; 
    const user = req.user._id ;
    const product = await Product.findByIdAndUpdate(productId, { $inc: { numberOfRating: 1} }, { new: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.feedBacks.push({ userId: user, rating: rating, comment: comment });
    await product.save();
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

    // check if product not found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if product has no feedback
    if (product.feedBacks.length === 0) {
      return res.status(200).json({
        message: "No ratings available yet for this product",
        averageRating: 0,
      });
    }

    // filter product feedback (rating not null)
    const validFeedbacks = product.feedBacks.filter((fb) => fb.rating !== null && fb.rating !== undefined);

    // if product has no valid feedback
    if (validFeedbacks.length === 0) {
      return res.status(200).json({
        message: "No valid ratings available for this product",
        averageRating: 0,
      });
    }

    // calculate average ratingResult
    const totalRating = validFeedbacks.reduce((acc, cur) => acc + cur.rating, 0);
    product.ratingResult = totalRating / validFeedbacks.length;

    res.status(200).json({
      message: "Rating calculated successfully",
      total: product.ratingResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving product rating",
      error: error.message,
    });
  }
};

exports.updateFeedbacks = async (req, res) => {
  try {
    const productId = req.params.id; // Lấy ID của sản phẩm từ params
    const { feedbackId, newFeedback } = req.body; // Lấy ID của feedback và dữ liệu feedback mới từ body

    // Tìm sản phẩm
    const product = await Product.findById(productId);

    // Kiểm tra nếu sản phẩm không tồn tại
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Tìm feedback cần cập nhật
    const feedback = product.feedBacks.id(feedbackId);
    // Kiểm tra nếu feedback không tồn tại
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Cập nhật nội dung feedback
    feedback.comment = newFeedback; // Thay đổi giá trị tùy thuộc vào cấu trúc feedback của bạn

    // Lưu sản phẩm sau khi cập nhật
    await product.save();

    // Trả về phản hồi thành công
    return res.status(200).json({ message: "Feedback updated successfully", feedback });
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({
      message: "Error updating feedback",
      error: error.message,
    });
  }
};

exports.showAllFeedbacks = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.feedBacks.length === 0) {
      return res.status(200).json({
        message: "No feedbacks available for this product",
        feedbacks: [],
      });
    }

    res.status(200).json({
      message: "Feedbacks retrieved successfully",
      feedbacks: product.feedBacks,
    })
    }
    catch (error) {
      res.status(500).json({
        message: "Error retrieving feedbacks",
        error: error.message,
      });
    }
}

exports.deleteFeedback = async (req, res) => {
  try {
    const productId = req.params.id;
    const feedbackId = req.params.feedbackId;

    // Tìm kế tập feedback
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Tìm kế tập feedback
    const feedback = product.feedBacks.id(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Xóa feedback
    product.feedBacks.remove(feedbackId);

    // Lưu sản phẩm sau khi xóa feedback
    await product.save();

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// filter product function
exports.getAllProducts = async (req, res) => {
  try {
    // Lấy các tham số từ query string
    const { category, minPrice, maxPrice, author, page = 1, limit = 10, sort } = req.query;

    // Tạo đối tượng điều kiện (query) cho việc tìm kiếm
    const query = {};

    // Lọc theo category nếu có
    if (category) query.category = { $in: category.split(",") }; // Lọc nhiều category, chuyển thành mảng

    // Lọc theo giá nếu có minPrice hoặc maxPrice
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice); // Lớn hơn hoặc bằng minPrice
      if (maxPrice) query.price.$lte = parseFloat(maxPrice); // Nhỏ hơn hoặc bằng maxPrice
    }

    // Lọc theo tác giả (author) nếu có
    if (author) query.author = { $in: author.split(",") }; // Lọc nhiều author, chuyển thành mảng

    // Chuyển đổi page và limit thành số nguyên (đảm bảo giá trị hợp lệ)
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Xác định thứ tự sắp xếp (sort)
    let sortOptions = {};
    switch (sort) {
      case "popularity":
        sortOptions = { countClick: -1 }; // Sắp xếp theo độ phổ biến giảm dần
        break;
      case "averageRating":
        sortOptions = { ratingResult: -1 }; // Sắp xếp theo đánh giá trung bình giảm dần
        break;
      case "latest":
        sortOptions = { createdAt: -1 }; // Sắp xếp theo ngày tạo mới nhất
        break;
      case "priceLowToHigh":
        sortOptions = { price: 1 }; // Giá từ thấp đến cao
        break;
      case "priceHighToLow":
        sortOptions = { price: -1 }; // Giá từ cao đến thấp
        break;
      default:
        sortOptions = {}; // Không sắp xếp nếu không có tham số `sort`
        break;
    }
    // Truy vấn danh sách sản phẩm theo điều kiện lọc và sắp xếp
    const products = await Product.find(query)
      .sort(sortOptions) // Áp dụng sắp xếp
      .skip((pageNumber - 1) * limitNumber) // Bỏ qua các sản phẩm của các trang trước
      .limit(limitNumber); // Giới hạn số lượng sản phẩm trả về

    // Đếm tổng số sản phẩm phù hợp với các điều kiện lọc
    const total = await Product.countDocuments(query);

    // Trả về kết quả
    res.status(200).json({
      data: products,
      currentPage: pageNumber, // Trang hiện tại
      totalPages: Math.ceil(total / limitNumber), // Tổng số trang
      totalItems: total, // Tổng số sản phẩm
    });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Xử lý lỗi
  }
};


exports.searchProduct = async (req, res) => {
  try {
    const { keyword } = req.query;

    // Kiểm tra nếu keyword không tồn tại hoặc không phải là chuỗi
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ message: "Keyword must be a non-empty string" });
    }

    // Tìm kiếm sản phẩm
    const products = await Product.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
      ],
    });

    // Trả về danh sách sản phẩm
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export file excel product
exports.exportFileProduct = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm từ cơ sở dữ liệu
    const products = await Product.find({shopId: req.user._id});
    // Nếu không có sản phẩm nào, trả về lỗi
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Tạo workbook và worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Đặt tiêu đề cho các cột
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Author', key: 'author', width: 20 },
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Sales Number', key: 'salesNumber', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Thêm dữ liệu sản phẩm vào worksheet
    products.forEach(product => {
      worksheet.addRow({
        title: product.title,
        description: product.description,
        price: product.price,
        author: product.author,
        category: product.category.join(", "), // Giả sử category là mảng
        stock: product.stock,
        salesNumber: product.salesNumber,
        createdAt: product.createdAt.toISOString() // Đảm bảo thời gian đúng định dạng
      });
    });

    // Đặt header cho response là Excel
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename=products.xlsx');

    // Gửi file Excel cho client
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({ message: error.message });
  }
};



