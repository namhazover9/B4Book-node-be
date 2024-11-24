const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Routes
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const shoppingCartRoute = require("./routes/shoppingCartRoute");
const orderRoute = require("./routes/orderRoute");
const corsConfig = require("./configs/cors.config");
const shopRoute = require("./routes/shopRoute");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors(corsConfig));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, 
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

// Routes
// api documentations
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
app.use("/order", orderRoute);
app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use("/shop", shopRoute);

// Start server
app.listen(port, () => {
  console.log(`Server is working on port: ${port}`);
  connectDb();
});
