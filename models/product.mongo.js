const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    status: String,
    request: mongoose.Schema.Types.Mixed,
    response: String,
  },
  { timestamps: true }
);

const Product_mongo = mongoose.model("Product", productSchema);

module.exports = Product_mongo;
