const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImages, deleteImage } = require('../services/cloudinaryService');

const buildProductFilter = (query) => {
  const filter = {};

  if (query.q) {
    filter.$text = { $search: query.q };
  }
  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategory = query.subcategory;
  if (query.condition) filter.condition = query.condition;
  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = 'available';
  }
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.sellerId) filter.sellerId = query.sellerId;

  return filter;
};

// @desc    Get all products
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const filter = buildProductFilter(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('sellerId', 'name college department profileImage')
      .sort(req.query.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'sellerId',
    'name college department year phone profileImage'
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, price, condition, specifications, subcategory } = req.body;

  let images = [];
  if (req.files?.length) {
    images = await uploadImages(req.files);
  }

  const product = await Product.create({
    title,
    description,
    category,
    price: Number(price),
    condition,
    specifications,
    subcategory,
    images,
    sellerId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Product created',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const isOwner = product.sellerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  const { title, description, category, price, condition, specifications, status, subcategory } = req.body;

  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (condition !== undefined) product.condition = condition;
  if (specifications !== undefined) product.specifications = specifications;
  if (subcategory !== undefined) product.subcategory = subcategory;
  if (status !== undefined && (isOwner || req.user.role === 'admin')) {
    product.status = status;
  }

  if (req.files?.length) {
    const newImages = await uploadImages(req.files);
    product.images = [...product.images, ...newImages];
  }

  product = await product.save();

  res.json({
    success: true,
    message: 'Product updated',
    data: product,
  });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const isOwner = product.sellerId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this product');
  }

  product.status = 'removed';
  await product.save();

  res.json({
    success: true,
    message: 'Product removed',
  });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
