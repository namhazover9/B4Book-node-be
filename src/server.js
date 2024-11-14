const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;
const configViewEngine = require("./config/configViewEngine");
const app = express();

//middleware
app.use(express.json());
app.use(cors());
//View Engine
configViewEngine(app);

app.listen(port, () => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
