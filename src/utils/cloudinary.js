const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: "ddhuhnzd2", // Lấy từ môi trường
  api_key: "326724317445812", // Lấy từ môi trường
  api_secret: "4qWNdGkQKlop9k5ZTTK7fDU1OPI", // Lấy từ môi trường
});

module.exports = cloudinary;
