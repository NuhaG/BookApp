const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("name, email, password are required");
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    password: String(password),
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400);
    throw new Error("email and password are required");
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
    "+password",
  );

  if (!user || !(await user.correctPassword(String(password), user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("User is banned");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});
