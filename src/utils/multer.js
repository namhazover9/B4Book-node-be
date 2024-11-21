const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Cấu hình lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "b4b-node-be", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Định dạng được phép
  },
});

const upload = multer({ storage });

module.exports = upload;
