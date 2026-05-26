const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ================= SIGNUP =================
exports.registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // clean input
    name = name?.trim();
    email = email?.toLowerCase().trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // save user
    const user = new User({
      name,
      email,
      // Password hashing is handled by User model pre('save') hook.
      password
    });

    await user.save();

    res.status(201).json({
      message: "Signup successful",
      token: signToken(user._id),
      user: { id: String(user._id), name: user.name, email: user.email }
    });

  } catch (error) {
    console.log("🔥 SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: signToken(user._id),
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("🔥 LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};