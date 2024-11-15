const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;

//route
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const inventoryRoutes = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const app = express();

const session = require("express-session");
const path = require("path");

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
app.use(cors());

//route
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/inventories", inventoryRoutes);
app.use("/", userRoute);

app.listen(port, () => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
