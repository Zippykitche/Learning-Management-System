const mongoose = require("mongoose");

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. MongoDB features will be disabled.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    // Register models to automatically initialize collections on new MongoDB instances
    require("../modules/audit/audit.model");
    require("../modules/lessons/lesson.model");
    require("../modules/progress/progress.model");

    console.log("MongoDB collections & schemas initialized ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

module.exports = connectMongo;