const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cookieParser = require('cookie-parser');

// Routes
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const shoppingCartRoute = require("./routes/shoppingCartRoute");
const orderRoute = require("./routes/orderRoute");
const corsConfig = require("./configs/cors.config");
const shopRoute = require("./routes/shopRoute");
const loginApi = require("./routes/loginRoute");
const userApi = require('./routes/user.api');
const accountApi = require('./routes/account.api');
const chatRoute = require('./routes/chatRoute');
const app = express();
const port = process.env.PORT || 8000;

app.use(cookieParser());

// Middleware
app.use(cors(corsConfig));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, 
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});


// Routes
// api documentations
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/products", productRoute);
app.use("/cart", shoppingCartRoute);
app.use("/order", orderRoute);
app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use("/shop", shopRoute);
app.use('/login', loginApi);
app.use('/user', userApi);
app.use('/account', accountApi);
app.use("/chat",chatRoute);
// Start server
app.listen(port, () => {
  console.log(`Server is working on port: ${port}`);
  connectDb();
});
