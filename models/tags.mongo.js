const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema(
  {
    status: String,
    request: mongoose.Schema.Types.Mixed,
    response: String,
  },
  { timestamps: true }
);

const Tags_mongo = mongoose.model("Tags", tagsSchema);

module.exports = Tags_mongo;
