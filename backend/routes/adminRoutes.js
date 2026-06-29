const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getAllProducts,
  updateProductStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { STATUSES } = require('../models/Product');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/products', getAllProducts);
router.patch(
  '/products/:id/status',
  [body('status').isIn(STATUSES).withMessage('Invalid status')],
  validate,
  updateProductStatus
);

module.exports = router;
