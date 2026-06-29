const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create or get chat thread
// @route   POST /api/chat
const createChat = asyncHandler(async (req, res) => {
  const { productId, sellerId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.sellerId.toString() !== sellerId) {
    throw new ApiError(400, 'Seller does not match this product');
  }

  if (sellerId === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot start a chat with yourself');
  }

  let chat = await Chat.findOne({
    buyerId: req.user._id,
    sellerId,
    productId,
  })
    .populate('buyerId', 'name profileImage')
    .populate('sellerId', 'name profileImage')
    .populate('productId', 'title price images status');

  if (!chat) {
    chat = await Chat.create({
      buyerId: req.user._id,
      sellerId,
      productId,
    });
    chat = await Chat.findById(chat._id)
      .populate('buyerId', 'name profileImage')
      .populate('sellerId', 'name profileImage')
      .populate('productId', 'title price images status');
  }

  res.status(201).json({
    success: true,
    data: chat,
  });
});

// @desc    Get user's chats
// @route   GET /api/chat
const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }],
  })
    .populate('buyerId', 'name profileImage')
    .populate('sellerId', 'name profileImage')
    .populate('productId', 'title price images status')
    .sort({ lastMessageAt: -1 });

  const chatsWithPreview = await Promise.all(
    chats.map(async (chat) => {
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .limit(1);
      return {
        ...chat.toObject(),
        lastMessage: lastMessage || null,
      };
    })
  );

  res.json({ success: true, data: chatsWithPreview });
});

// @desc    Send message
// @route   POST /api/chat/message
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, message } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant =
    chat.buyerId.toString() === req.user._id.toString() ||
    chat.sellerId.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, 'Not authorized for this chat');
  }

  const newMessage = await Message.create({
    chatId,
    senderId: req.user._id,
    message,
  });

  chat.lastMessageAt = new Date();
  await chat.save();

  const populated = await Message.findById(newMessage._id).populate(
    'senderId',
    'name profileImage'
  );

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
const getMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const isParticipant =
    chat.buyerId.toString() === req.user._id.toString() ||
    chat.sellerId.toString() === req.user._id.toString();

  if (!isParticipant) {
    throw new ApiError(403, 'Not authorized for this chat');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const filter = { chatId: chat._id };
  if (req.query.before) {
    filter.createdAt = { $lt: new Date(req.query.before) };
  }

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ chatId: chat._id }),
  ]);

  res.json({
    success: true,
    data: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = { createChat, getChats, sendMessage, getMessages };
