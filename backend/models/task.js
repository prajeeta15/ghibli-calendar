const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  tasks: [{ text: String, completed: Boolean }]
});

module.exports = mongoose.model("Task", TaskSchema);
