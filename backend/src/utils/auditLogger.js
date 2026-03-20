const Audit = require("../modules/audit/audit.model");

exports.logAction = async (userId, action, metadata = {}) => {
  try {
    await Audit.create({
      userId,
      action,
      metadata,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};