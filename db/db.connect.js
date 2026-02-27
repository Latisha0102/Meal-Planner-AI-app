const mongoose = require("mongoose");

require("dotenv").config();

const mongouri = process.env.MONGODB;

const initializeDatabase = async () => {
  await mongoose
    .connect(mongouri)
    .then(() => {
      console.log("Connected to Mongo Db");
    })
    .catch((error) => {
      console.log("Error connecting in database", error);
    });
};

module.exports = { initializeDatabase };
