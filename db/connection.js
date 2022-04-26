const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("connected with monogdb");
  } catch (error) {
    console.log("error connecting with monogdb: ", error);
  }
};
