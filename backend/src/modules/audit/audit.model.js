const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  userId: Number,
  action: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Audit", auditSchema);