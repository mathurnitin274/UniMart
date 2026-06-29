const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Clothing',
  'Sports',
  'Accessories',
  'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const STATUSES = ['available', 'sold', 'removed'];

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 5000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: CONDITIONS,
    },
    specifications: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'available',
    },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
module.exports.STATUSES = STATUSES;
