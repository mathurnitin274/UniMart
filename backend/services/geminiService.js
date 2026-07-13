const { GoogleGenerativeAI } = require('@google/generative-ai');
const ApiError = require('../utils/ApiError');

const getMockContent = ({ title, condition, usage, specifications }) => {
  const lowerTitle = title.toLowerCase();
  let category = 'Other';
  let priceRange = '₹500 - ₹1,500';

  if (lowerTitle.includes('laptop') || lowerTitle.includes('phone') || lowerTitle.includes('earphone') || lowerTitle.includes('charger') || lowerTitle.includes('electronics') || lowerTitle.includes('macbook') || lowerTitle.includes('ipad') || lowerTitle.includes('keyboard')) {
    category = 'Electronics';
    priceRange = '₹12,000 - ₹25,000';
    if (lowerTitle.includes('earphone') || lowerTitle.includes('keyboard') || lowerTitle.includes('charger')) {
      priceRange = '₹400 - ₹1,200';
    }
  } else if (lowerTitle.includes('book') || lowerTitle.includes('novel') || lowerTitle.includes('semester') || lowerTitle.includes('exam') || lowerTitle.includes('physics') || lowerTitle.includes('chemistry') || lowerTitle.includes('maths')) {
    category = 'Books';
    priceRange = '₹200 - ₹500';
  } else if (lowerTitle.includes('chair') || lowerTitle.includes('table') || lowerTitle.includes('desk') || lowerTitle.includes('bed') || lowerTitle.includes('furniture')) {
    category = 'Furniture';
    priceRange = '₹1,500 - ₹4,000';
  } else if (lowerTitle.includes('shirt') || lowerTitle.includes('tshirt') || lowerTitle.includes('jeans') || lowerTitle.includes('jacket') || lowerTitle.includes('hoodie') || lowerTitle.includes('clothing') || lowerTitle.includes('shoe')) {
    category = 'Clothing';
    priceRange = '₹500 - ₹1,500';
  } else if (lowerTitle.includes('cycle') || lowerTitle.includes('bicycle') || lowerTitle.includes('bat') || lowerTitle.includes('ball') || lowerTitle.includes('racket') || lowerTitle.includes('sports')) {
    category = 'Sports';
    priceRange = '₹1,000 - ₹3,500';
  } else if (lowerTitle.includes('bag') || lowerTitle.includes('backpack') || lowerTitle.includes('watch') || lowerTitle.includes('wallet') || lowerTitle.includes('accessory')) {
    category = 'Accessories';
    priceRange = '₹300 - ₹900';
  }

  const specStr = specifications ? ` Specifications: ${specifications}.` : '';
  const usageStr = usage ? ` Used for about ${usage}.` : '';
  const description = `Selling my ${title} which is in ${condition.toLowerCase()} condition.${specStr}${usageStr} It is in good working order and perfect for college students looking for a deal. DM for more details or to negotiate!`;

  return {
    description,
    priceRange,
    category
  };
};

const generateProductContent = async ({ title, condition, usage, specifications }) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured. Falling back to mock generator.');
    return getMockContent({ title, condition, usage, specifications });
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
