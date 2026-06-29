const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');
const { CATEGORIES, CONDITIONS, STATUSES } = require('../models/Product');

const router = express.Router();

const productValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('condition').isIn(CONDITIONS).withMessage('Invalid condition'),
];

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', protect, uploadProductImages, productValidation, validate, createProduct);

router.put(
  '/:id',
  protect,
  uploadProductImages,
  [
    body('title').optional().trim().notEmpty(),
    body('category').optional().isIn(CATEGORIES),
    body('price').optional().isFloat({ min: 0 }),
    body('condition').optional().isIn(CONDITIONS),
    body('status').optional().isIn(STATUSES),
  ],
  validate,
  updateProduct
);

router.delete('/:id', protect, deleteProduct);

module.exports = router;
