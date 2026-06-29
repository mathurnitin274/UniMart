const { generateProductContent } = require('../services/geminiService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Generate AI product description and price
// @route   POST /api/ai/generate
const generateContent = asyncHandler(async (req, res) => {
  const result = await generateProductContent(req.body);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = { generateContent };
