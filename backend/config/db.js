const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      'Error: MONGODB_URI is not set. Copy backend/.env.example to backend/.env and add your MongoDB connection string.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error(
      'Check that MongoDB is running locally, or set MONGODB_URI in backend/.env to your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
