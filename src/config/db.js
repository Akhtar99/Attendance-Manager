const mongoose = require("mongoose");
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
