const Category_mongo = require("../../models/category.mongo");

const createResCategoryMongo = async (status, requestd, response) => {
  await Category_mongo.create({
    status: status,
    request: requestd,
    response: response,
  });
};

module.exports = { createResCategoryMongo };
