const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { generateContent } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests, try again later' },
});

router.post(
  '/generate',
  protect,
  aiLimiter,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('condition').trim().notEmpty().withMessage('Condition is required'),
    body('usage').optional().trim(),
    body('specifications').optional().trim(),
  ],
  validate,
  generateContent
);

module.exports = router;
