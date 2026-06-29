const express = require('express');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
