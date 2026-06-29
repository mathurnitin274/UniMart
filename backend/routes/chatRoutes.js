const express = require('express');
const { body } = require('express-validator');
const {
  createChat,
  getChats,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('sellerId').notEmpty().withMessage('Seller ID is required'),
  ],
  validate,
  createChat
);

router.get('/', getChats);

router.post(
  '/message',
  [
    body('chatId').notEmpty().withMessage('Chat ID is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  sendMessage
);

router.get(
  '/:chatId/messages',
  getMessages
);

module.exports = router;
