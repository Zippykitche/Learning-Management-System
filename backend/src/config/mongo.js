const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error('Mongo error:', err);
  }
};

module.exports = connectMongo;