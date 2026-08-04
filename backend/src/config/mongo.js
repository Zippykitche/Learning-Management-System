const mongoose = require("mongoose");

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. MongoDB logging will be disabled.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

module.exports = connectMongo;