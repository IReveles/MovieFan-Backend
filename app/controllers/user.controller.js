const db = require("../models");
const User = db.User;

// Create new user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.create({ email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (for testing)
exports.getAll = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};
