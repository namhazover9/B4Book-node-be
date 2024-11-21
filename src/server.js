const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

// Routes
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const shoppingCartRoute = require("./routes/shoppingCartRoute");
const orderRoute = require("./routes/orderRoute");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, 
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

// Routes
app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
app.use("/order", orderRoute);
app.use("/", userRoute);
app.use("/admin", adminRoute);

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is working on port: ${port}`);
  connectDb();
});
