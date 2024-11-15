const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;
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

//View Engine
app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

app.use("/", userRoute);

app.listen(port, () => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
