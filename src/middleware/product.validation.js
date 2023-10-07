const { createProduct } = require("../controller/product");
const { createResProductMongo } = require("../service_mongo/product");

const validationProduct = async (input) => {
  const { name, price, stock, location, barcode } = input;

  const colorTextError = "\x1b[31m%s\x1b[0m";

  if (name.length === 0) {
    await createResProductMongo("Bad Request", input, "name cannot be empty");
    return console.log(colorTextError, "##### name cannot be empty #####");
  }

  if (price.length <= 0) {
    await createResProductMongo("Bad Request", input, "price cannot be empty");
    return console.log(colorTextError, "##### price cannot be empty #####");
  } else if (typeof Number(price) !== "number" || isNaN(Number(price))) {
    await createResProductMongo("Bad Request", input, "price must be a number");
    return console.log(colorTextError, "##### price must be a number #####");
  }

  if (stock.length <= 0) {
    await createResProductMongo("Bad Request", input, "stock minimum number 1");
    return console.log(colorTextError, "##### stock minimum number 1 #####");
  } else if (typeof Number(stock) !== "number" || isNaN(Number(stock))) {
    await createResProductMongo("Bad Request", input, "stock must be a number");
    return console.log(colorTextError, "##### stock must be a number #####");
  }

  if (location.length <= 0) {
    await createResProductMongo(
      "Bad Request",
      input,
      "location cannot be empty"
    );
    return console.log(colorTextError, "##### location cannot be empty #####");
  }
  if (barcode.length <= 0) {
    await createResProductMongo(
      "Bad Request",
      input,
      "barcode cannot be empty"
    );
    return console.log(colorTextError, "##### barcode cannot be empty #####");
  } else if (barcode.length >= 10) {
    await createResProductMongo(
      "Bad Request",
      input,
      "Maximum length of barcodes is 10"
    );
    return console.log(
      colorTextError,
      "##### Maximum length of barcodes is 10 #####"
    );
  }
  await createProduct(input);
};
module.exports = validationProduct;
