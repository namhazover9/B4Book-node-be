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
const app = express();

const session = require("express-session");
const path = require("path");
app.use(bodyParser.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

//middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", methods:["GET", "POST", "PUT", "DELETE"], credentials: true }));

//route
app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
// app.use("/categories", categoryRoutes);
// app.use("/inventories", inventoryRoutes);
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
