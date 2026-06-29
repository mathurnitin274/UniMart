const { GoogleGenerativeAI } = require('@google/generative-ai');
const ApiError = require('../utils/ApiError');

const generateProductContent = async ({ title, condition, usage, specifications }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'AI service is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are helping a college student sell an item on a campus marketplace in India.
Given the product details below, respond with ONLY valid JSON (no markdown, no code fences) in this exact shape:
{"description":"...","priceRange":"₹X - ₹Y","category":"..."}

Product title: ${title}
Condition: ${condition}
Usage duration: ${usage || 'Not specified'}
Specifications: ${specifications || 'Not specified'}

Rules:
- description: 2-4 sentences, friendly and honest for students
- priceRange: realistic INR range for Indian college resale market
- category: one of Electronics, Books, Furniture, Clothing, Sports, Accessories, Other`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      description: parsed.description || '',
      priceRange: parsed.priceRange || '',
      category: parsed.category || 'Other',
    };
  } catch {
    throw new ApiError(502, 'Failed to parse AI response');
  }
};

module.exports = { generateProductContent };
