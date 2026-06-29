const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

chatSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
