const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;

const configViewEngine = require("./config/configViewEngine");

//route
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const inventoryRoutes = require("./routes/inventoryRoute");


const app = express();
const userRoute = require("./routes/userRoute");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// app.use(passport.initialize());
// app.use(passport.session());

//middleware
app.use(express.json());
app.use(cors());


//route
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/inventories", inventoryRoutes);


//View Engine
app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

app.use("/", userRoute);

app.listen(port, () => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
