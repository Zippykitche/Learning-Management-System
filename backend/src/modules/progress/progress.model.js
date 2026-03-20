const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: Number,
  courseId: Number,
  completedLessons: [String],
});

module.exports = mongoose.model("Progress", progressSchema);