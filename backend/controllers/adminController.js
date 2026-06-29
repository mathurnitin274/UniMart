const User = require('../models/User');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { STATUSES } = require('../models/Product');

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get all products (including removed/sold)
// @route   GET /api/admin/products
const getAllProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('sellerId', 'name email college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Update product status
// @route   PATCH /api/admin/products/:id/status
const updateProductStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${STATUSES.join(', ')}`);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('sellerId', 'name email');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    message: 'Product status updated',
    data: product,
  });
});

module.exports = { getUsers, getAllProducts, updateProductStatus };
