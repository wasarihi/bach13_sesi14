const Tags_mongo = require("../../models/tags.mongo");

const createResTagsMongo = async (status, requestd, response) => {
  await Tags_mongo.create({
    status: status,
    request: requestd,
    response: response,
  });
};

module.exports = { createResTagsMongo };
