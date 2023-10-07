const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    status: String,
    request: mongoose.Schema.Types.Mixed,
    response: String,
  },
  { timestamps: true }
);

const Category_mongo = mongoose.model("Category", categorySchema);

module.exports = Category_mongo;
