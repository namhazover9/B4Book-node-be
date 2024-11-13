const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.Db_url, {
      dbName: "ChatBot",
    });
    console.log("connect database success!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb;
