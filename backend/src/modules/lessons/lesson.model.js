const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  courseId: Number,
  title: String,
  type: String,
  content: String,
});

module.exports = mongoose.model("Lesson", lessonSchema);