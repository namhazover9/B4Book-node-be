const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");
//route
const productRoute = require("./routes/productRoute");
// const categoryRoutes = require("./routes/categoryRoute");
// const inventoryRoutes = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute")
const shoppingCartRoute = require("./routes/shoppingCartRoute");
const orderRoute = require("./routes/orderRoute");

const app = express();

const session = require("express-session");
const path = require("path");
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Key bảo mật (tạo bí mật mạnh và không chia sẻ công khai)
    resave: false, // Không lưu lại session nếu không thay đổi
    saveUninitialized: false, // Không lưu trữ session mới nếu không có gì thay đổi
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Cookie chỉ sử dụng trên HTTPS khi ở môi trường production
      httpOnly: true, // Giới hạn khả năng truy cập cookie từ JavaScript
      maxAge: 60 * 60 * 1000, // Thời gian hết hạn cookie (1 giờ)
    },
  })
);

app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

//middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//route
app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
app.use("/order", orderRoute);
// app.use("/categories", categoryRoutes);
// app.use("/inventories", inventoryRoutes);
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(port, '0.0.0.0',() => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
