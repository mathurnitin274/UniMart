const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../services/cloudinaryService');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  department: user.department,
  year: user.year,
  phone: user.phone,
  profileImage: user.profileImage,
  role: user.role,
  createdAt: user.createdAt,
});

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, department, year, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(400, 'Email already registered');
  }

  const role =
    process.env.ADMIN_EMAIL &&
    email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
      ? 'admin'
      : 'student';

  const user = await User.create({
    name,
    email,
    password,
    college,
    department,
    year,
    phone,
    role,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: formatUser(req.user),
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, college, department, year, phone } = req.body;

  const user = req.user;

  if (name !== undefined) user.name = name;
  if (college !== undefined) user.college = college;
  if (department !== undefined) user.department = department;
  if (year !== undefined) user.year = year;
  if (phone !== undefined) user.phone = phone;

  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, 'unimart/profiles');
    user.profileImage = uploaded.url;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated',
    data: formatUser(user),
  });
});

// @desc    Logout (client clears token)
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Clear the token on the client.',
  });
});

module.exports = { register, login, getProfile, updateProfile, logout };
