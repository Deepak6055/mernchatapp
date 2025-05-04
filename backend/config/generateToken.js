const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();


const generateToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: "30d",
  });
};
const token = generateToken("680b99b9b8b58c261b6ed506"); // Replace with a valid user ID
console.log("Bearer Token:", token);
module.exports = generateToken;
