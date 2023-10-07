const { PrismaClient } = require("@prisma/client");
const Prisma = new PrismaClient();

async function register(p_username, p_email, p_password) {
  const user = await Prisma.user.create({
    data: {
      username: p_username,
      email: p_email,
      password: p_password,
    }
  });
  return console.log (user) 
}

async function login(p_username, p_password) {
  try {
    const user = await Prisma.user.findFirst({
      where: { username: p_username, password: p_password }
    });
    if (!user){
      console.log ("not found")
    } else if (p_password !== user.password){
      console.log ("password wrong")
    } else {
      return "succes"
    }
    } catch (error) {
      console.log ("error")
    }
}

async function changePassword(email, password, newPassword) {
  try {
    let changePassword = await Prisma.user.update({
      where: { email: email },
      data: { password: newPassword },
    });
    if (!changePassword){
      console.log ("not found")
    } else {
      return console.log ("succes")
    }
    } catch (error) {
      console.log (error)
    }
  }
  
module.exports = {
  register,
  login,
  changePassword,
}