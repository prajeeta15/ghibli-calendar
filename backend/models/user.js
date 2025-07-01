const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lastOpenedDate: { type: String } // e.g., "2025-06-30"
});

module.exports = mongoose.model("user", UserSchema);
