const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const User = require("../models/user");

// --- Mock Authentication Middleware ---
router.use(async (req, res, next) => {
  try {
    let user = await User.findOne({ username: "prajeeta" });
    if (!user) user = await User.create({ username: "prajeeta" });
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ error: "Internal Server Error (auth)" });
  }
});

// --- GET Last Opened Date ---
router.get("/last-opened", async (req, res) => {
  try {
    const user = await User.findOne({ username: "prajeeta" });
    res.json({ lastOpenedDate: user?.lastOpenedDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET Tasks by Date ---
router.get("/:date", async (req, res) => {
  const { user } = req;
  const { date } = req.params;
  try {
    const taskData = await Task.findOne({ userId: user._id, date });
    res.json(taskData?.tasks || []);
  } catch (err) {
    console.error("GET /:date Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- POST or Update Tasks for a Date ---
router.post("/:date", async (req, res) => {
  const { user } = req;
  const { date } = req.params;
  const { tasks } = req.body;

  try {
    const saved = await Task.findOneAndUpdate(
      { userId: user._id, date },
      { tasks },
      { upsert: true, new: true }
    );

    // Save last opened date for the user
    user.lastOpenedDate = date;
    await user.save();

    res.status(200).json({ message: "Tasks saved", data: saved });
  } catch (err) {
    console.error("POST /:date Error:", err);
    res.status(500).json({ error: "Could not save tasks" });
  }
});

module.exports = router;
