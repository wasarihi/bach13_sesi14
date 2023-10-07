const { PrismaClient } = require("@prisma/client");
const Table = require("cli-table");
const { createResProductMongo } = require("../service_mongo/product");
const { createResCategoryMongo } = require("../service_mongo/category");
const Prisma = new PrismaClient();
const Product = Prisma.product;
const User = Prisma.user;
const Categories = Prisma.category;

const colorTextSuccess = "\x1b[32m%s\x1b[0m";
const colorTextError = "\x1b[31m%s\x1b[0m";

const checkFindProduct = async (input) => {
  const find = await Product.findUnique({
    where: {
      id: input,
      status: true,
    },
    select: {
      name: true,
      price: true,
      stock: true,
      location: true,
      barcode: true,
      category: {
        select: {
          productId: true,
          tagsId: true,
        },
      },
    },
  });
  if (!find) {
    return console.log(
      colorTextError,
      `##### id product ${input} not found #####`
    );
  } else {
    return { status: "Success", data: find };
  }
};
const createProduct = async (input) => {
  const { name, price, stock, location, barcode, user, categories } = input;
  try {
    const findUser = await User.findFirst({
      where: {
        username: user,
      },
    });

    const findBarcode = await Product.findUnique({
      where: {
        barcode: barcode,
      },
    });
    if (findBarcode) {
      await createResProductMongo(
        "Concurrency Conflict",
        input,
        "Product with the same barcode already exists"
      );
      return console.log(
        colorTextError,
        "##### Product with the same barcode already exists #####"
      );
    } else {
      const createProduct = await Product.create({
        data: {
          barcode: barcode,
          name: name,
          price: price,
          stock: Number(stock),
          location: location,
          userId: findUser.id,
        },
      });
      if (categories.length > 0) {
        await Promise.all(
          categories.map(async (i) => {
            await Categories.create({
              data: {
                productId: createProduct.id,
                tagsId: i,
              },
            });
            await createResCategoryMongo(
              "Success",
              {
                productId: createProduct.id,
                tagsId: i,
              },
              "Success create Category"
            );
          })
        );
      }

      await createResProductMongo("Success", input, "Success create product");
      return console.log(
        colorTextSuccess,
        "##### Success create product #####"
      );
    }
  } catch (error) {
    await createResProductMongo("unauthorized", input, "Please login first");
    console.log(colorTextError, "##### Please login first #####");
  }
};

const updateProduct = async (input) => {
  try {
    let { id, name, price, stock, location, barcode, categories } = input.input;
    if (name.length === 0) {
      name = input.data.name;
    }
    if (price.length === 0) {
      price = input.data.price;
    } else if (typeof Number(price) !== "number" || isNaN(Number(price))) {
      return console.log(colorTextError, "##### price must be a number #####");
    }
    if (stock.length <= 0) {
      stock = input.data.stock;
    } else if (stock[0] === "-") {
      stock = input.data.stock - parseInt(stock.replace("-", ""));
    } else if (stock[0] === "+") {
      stock = input.data.stock + parseInt(stock.replace("+", ""));
    } else {
      return console.log(colorTextError, "##### input stock invalid #####");
    }

    if (location.length <= 0) {
      location = input.data.location;
    }
    if (barcode.length <= 0) {
      barcode = input.data.barcode;
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
    const findBarcode = await Product.findUnique({
      where: {
        barcode: barcode,
      },
    });
    if (findBarcode) {
      await createResProductMongo(
        "Concurrency Conflict",
        input,
        "Product with the same barcode already exists"
      );
      return console.log(
        colorTextError,
        "##### Product with the same barcode already exists #####"
      );
    } else {
      // if (categories.length <= 0) {
      //   categories = input.data.category;
      // }
      const updateProduct = await Product.update({
        where: {
          id: id,
          status: true,
        },
        data: {
          barcode: barcode,
          name: name,
          price: price,
          stock: Number(stock),
          location: location,
          updatedAt: new Date(),
        },
      });
      if (categories.length > 0) {
        await Categories.deleteMany({
          where: {
            productId: id,
          },
        });
        await createResCategoryMongo(
          "Success",
          { productId: id },
          `Success Delete Category Product ${name}`
        );
        await Promise.all(
          categories.map(async (i) => {
            console.log(i);
            await Categories.create({
              data: {
                productId: id,
                tagsId: i,
              },
            });
            await createResCategoryMongo(
              "Success",
              { productId: id, tagsId: i },
              `Success Change Category Product ${name}`
            );
          })
        );
      }

      await createResProductMongo(
        "Success",
        { name, price, stock, location, barcode, categories },
        "Success update product"
      );
      return console.log(
        colorTextSuccess,
        "##### Success Update Product #####"
      );
    }
  } catch (error) {
    console.log(error);
    await createResProductMongo("Error", input.input, "Product id Not Found");
    return console.log(colorTextError, "##### Product id Not Found #####");
  }
};

const deleteProduct = async (input) => {
  try {
    await Product.update({
      where: {
        id: input,
        status: true,
      },
      data: {
        status: false,
        updatedAt: new Date(),
      },
    });

    await createResProductMongo(
      "Success",
      { id: input },
      "Success Delete product"
    );
    return console.log(colorTextSuccess, "##### Success Delete Product #####");
  } catch (error) {
    await createResProductMongo(
      "Not Found",
      { id: input },
      "Product Not Found"
    );
    return console.log(colorTextError, "##### id Product Not Found #####");
  }
};

const searchProduct = async (input) => {
  try {
    const products = await Product.findMany({
      where: {
        OR: [
          {
            status: true,
            name: {
              contains: input,
            },
          },
          {
            category: {
              some: {
                tags: {
                  name_tags: {
                    contains: input,
                  },
                },
              },
            },
          },
          {
            location: {
              contains: input,
            },
          },
        ],
      },
      select: {
        barcode: true,
        name: true,
        price: true,
        stock: true,
        location: true,
        category: {
          select: {
            tags: {
              select: {
                name_tags: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    if (products.length > 0) {
      await createResProductMongo(
        "Success",
        { keyword: input },
        JSON.stringify(products)
      );
      const table = new Table({
        head: [
          "id",
          "Name",
          "Price",
          "Stock",
          "Location",
          "Barcode",
          "Category",
        ],
        colWidths: [5, 20, 20, 20, 20, 20, 20],
      });
      products.forEach((item, index) => {
        let category = [];
        if (item.category.length === 0) {
          category.push("");
        } else {
          if (item.category.length === 1) {
            if (typeof item.category[0] === "object") {
              category.push(item.category[0].tags.name_tags);
            } else {
              category.push("");
            }
          } else {
            const categoryNames = item.category
              .map((cat) => cat.tags.name_tags)
              .join(", ");
            category.push(categoryNames);
          }
        }

        table.push([
          index + 1,
          item.name,
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(item.price),
          item.stock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          item.location,
          item.barcode,
          category,
        ]);
      });
      return console.log(table.toString());
    } else {
      await createResProductMongo(
        "Not Found",
        { keyword: input },
        "Product Not Found"
      );
      return console.log(colorTextError, "##### Product Not Found #####");
    }
  } catch (error) {
    return console.log(error);
  }
};

const findSpesificProductbyUser = async (input) => {
  const findProduct = await Product.findMany({
    where: {
      user: {
        username: input,
      },
      status: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      location: true,
      barcode: true,
      category: {
        select: {
          tags: {
            select: {
              name_tags: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  if (findProduct.length === 0) {
    await createResProductMongo(
      "Not Found",
      { user: input },
      "Product Not Found"
    );
   console.log(colorTextError, "##### Not Found Product #####");
   return "Error"
  } else {
    const formattedProducts = findProduct.map((product) => ({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(product.price),
      stock: product.stock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      location: product.location,
      barcode: product.barcode,
      category: product.category.map((item) => item.tags.name_tags).join(", "),
    }));
    return console.table(formattedProducts);
  }
};

async function listProduct() {
  const products = await Prisma.product.findMany({
    where: {
      status: true,
    },
  });
  return console.log(products);
}

module.exports = {
  checkFindProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  listProduct,
  findSpesificProductbyUser,
};
