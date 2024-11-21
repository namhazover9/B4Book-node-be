const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const passport = require("passport");
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
    secret: "your-secret-key",  // Sử dụng một chuỗi bí mật
    resave: false,  // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true,  // Lưu lại session mới mặc dù chưa được sử dụng
    cookie: { secure: true },  // Đặt secure: true nếu bạn sử dụng HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

//middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // URL frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Cho phép cookie hoặc token qua header
  next(); // Tiếp tục xử lý yêu cầu
});
app.use(cors({
  origin: "http://localhost:5173", // URL frontend
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // Cho phép cookie hoặc header Authorization
}));

app.use(express.urlencoded({ extended: true }));
//route


app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
app.use("/order", orderRoute);

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(port, '0.0.0.0',() => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
