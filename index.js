const prompt = require("prompt-sync")({ sigint: true });
const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();
const User = Prisma.user;

const { allTags, createTags } = require("./src/controller/tags");
const validationProduct = require("./src/middleware/product.validation");
const {
  checkFindProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  listProduct,
  findSpesificProductbyUser,
} = require("./src/controller/product");
const { login } = require("./src/controller/user");
const connectDB = require("./config/config");
const {
  registerValidation,
  changePasswordValidation,
} = require("./src/middleware/user.validation");

let colorTextMenu = "\x1b[34m%s\x1b[0m";
var isRunning = true;
var secondRunning = false;
var categori = [];
let user = null;

let showCategories = async () => {
  const find = await allTags();
  if (find === "NotFound") {
    return console.log("\x1b[31m%s\x1b[0m", "##### Tags Not Found #####");
  } else {
    find.map((i, index) =>
      categori.push({
        number: index + 1,
        id: i.id,
        nameCategori: i.name_tags,
      })
    );

    console.table(
      categori.map((item) => ({
        number: item.number,
        nameCategori: item.nameCategori,
      }))
    );
  }
};

(async () => {
  // connec mongoDB
  await connectDB();
  while (isRunning) {
    console.log(colorTextMenu, "1. Login");
    console.log(colorTextMenu, "2. Register");
    console.log(colorTextMenu, "3. Search Product");
    console.log(colorTextMenu, "4. List Product");
    console.log(colorTextMenu, "5. Create Tags");
    console.log(colorTextMenu, "6. Exit");

    let input = prompt("Please input menu ");

    if (Number(input) === 1) {
      let name = prompt("Please input your name ");
      let password = prompt("Please input your password ");
      let logins = await login(name, password);
      if (logins === "succes") {
        isRunning = false;
        secondRunning = true;
        user = name;
      }
    }
    if (Number(input) === 2) {
      let name = prompt("Please input your name ");
      let email = prompt("Please input your email ");
      let password = prompt("Please input your password ");
      await registerValidation(name, email, password);
    }
    if (Number(input) === 3) {
      console.log("can search by product name, location, and category");
      let input = prompt("Please input name product ");

      await searchProduct(input);
    }

    if (Number(input) === 4) {
      await listProduct();
    }
    if (Number(input) === 5) {
      let name_Categori = prompt("Please input name tags ");
      await createTags(name_Categori);
    }
    if (Number(input) === 6) {
      isRunning = false;
    }
    // Main Menu
    while (secondRunning) {
      console.log(colorTextMenu, "1. Show all category");
      console.log(colorTextMenu, "2. Add Product");
      console.log(colorTextMenu, "3. Update Data");
      console.log(colorTextMenu, "4. Delete Product");
      console.log(colorTextMenu, "5. Change Password");
      console.log(colorTextMenu, "6. Logout");

      let input = prompt("Please input menu ");

      if (Number(input) === 1) {
        await showCategories();
        categori = [];
      }

      if (Number(input) === 2) {
        let name = prompt("Please input your name product ");
        let price = prompt("Please input your price product ");
        let stock = prompt("Please input your stock product ");
        let location = prompt("Please input your location ");
        let barcode = prompt("Please input your code barcode ");
        await showCategories();

        const categoriesArray = [];
        const urutan = [];
        let status = true;

        while (status) {
          const categories = prompt("Please input number categories");

          if (urutan.includes(Number(categories))) {
            console.log("Already category selected");
          } else {
            const matchedCategory = categori.find(
              (e) => Number(e.number) === Number(categories)
            );
            if (matchedCategory) {
              categoriesArray.push(matchedCategory.id);
              urutan.push(Number(matchedCategory.number));
            } else {
              console.log("Invalid category number");
            }
          }

          const cekStatus = prompt("Input again? (y/n)");
          if (cekStatus.toLowerCase() === "n") {
            status = false;
          }
        }
        categori = [];
        const input = {
          name: name,
          price: price,
          stock: stock,
          location: location,
          barcode: barcode,
          user: user,
          categories: categoriesArray,
        };
        await validationProduct(input);
      }
      if (Number(input) === 3) {
        let status1 = false;
        let data = null;
        const showProduct = await findSpesificProductbyUser(user).then(async(response)=>{
          if(response !== "Error"){
            let id = prompt("Please input id product ");
        await checkFindProduct(id)
          .then((response) => {
            if (response.status === "Success") {
              status1 = true;
              data = response.data;
            }
          })
          .catch((err) => {
            null;
          });
        while (status1) {
          let name = prompt("Please input your name product ");
          let price = prompt("Please input your price product ");
          console.log(
            "---please make sure if you want to add stock start with + and otherwise start with - (example : -1 or +1)"
          );
          let stock = prompt("Please input your stock product ");
          let location = prompt("Please input your location ");
          let barcode = prompt("Please input your code barcode ");
          await showCategories();

          const categoriesArray = [];
          const urutan = [];
          let status = true;

          while (status) {
            console.log(categoriesArray);
            const categories = prompt("Please input number categories");

            if (urutan.includes(Number(categories))) {
              console.log("Already category selected");
            } else {
              const matchedCategory = categori.find(
                (e) => Number(e.number) === Number(categories)
              );
              if (matchedCategory) {
                categoriesArray.push(matchedCategory.id);
                urutan.push(Number(matchedCategory.number));
              } else {
                console.log("Invalid category number");
              }
            }

            const cekStatus = prompt("Input again? (y/n)");
            if (cekStatus.toLowerCase() === "n") {
              status = false;
            }
          }
          categori = [];
          const input = {
            id: id,
            name: name,
            price: price,
            stock: stock,
            location: location,
            barcode: barcode,
            user: "rajih",
            categories: categoriesArray,
          };

          await updateProduct({ input: input, data: data });
          status1 = false;
        }
          }
        })
        
      }
      if (Number(input) === 4) {
        await findSpesificProductbyUser(user).then(async(response)=>{
          if(response !== "Error"){
            let input = prompt("Please input id product ");

            await deleteProduct(input);
          }
        })
       
      }
      if (Number(input) === 5) {
        let email = prompt("Please input your email ");
        let password = prompt("Please input your Old Password ");
        let newPassword = prompt("Please input your New Password ");
        await changePasswordValidation(email, password, newPassword);
      }
      if (Number(input) === 6) {
        isRunning = true;
        secondRunning = false;
      }
    }
    // end Main Menu
  }
})();
