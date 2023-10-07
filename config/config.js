const mongoose = require("mongoose");

const mongoURI = "mongodb://127.0.0.1:27017/db_monitor_management_stock";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    return console.log("Connected to MongoDB");
  } catch (error) {
    return console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDB;
