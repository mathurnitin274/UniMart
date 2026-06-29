const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const existing = await Wishlist.findOne({
    userId: req.user._id,
    productId: req.params.productId,
  });

  if (existing) {
    return res.json({
      success: true,
      message: 'Already in wishlist',
      data: existing,
    });
  }

  const item = await Wishlist.create({
    userId: req.user._id,
    productId: req.params.productId,
  });

  res.status(201).json({
    success: true,
    message: 'Added to wishlist',
    data: item,
  });
});

// @desc    Get wishlist
// @route   GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ userId: req.user._id })
    .populate({
      path: 'productId',
      populate: { path: 'sellerId', select: 'name college profileImage' },
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: items });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const item = await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId: req.params.productId,
  });

  if (!item) {
    throw new ApiError(404, 'Wishlist item not found');
  }

  res.json({
    success: true,
    message: 'Removed from wishlist',
  });
});

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
