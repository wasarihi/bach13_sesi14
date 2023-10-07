const Product_mongo = require("../../models/product.mongo");

const createResProductMongo = async (status, requestd, response) => {
  await Product_mongo.create({
    status: status,
    request: requestd,
    response: response,
  });
};

module.exports = { createResProductMongo };
