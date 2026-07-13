require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = require('./models/Product');
  const res = await Product.updateMany(
    { category: 'Electronics' },
    { $set: { subcategory: 'Other Electronics' } }
  );
  console.log('Update result:', res);
  process.exit(0);
}

run().catch(console.error);
