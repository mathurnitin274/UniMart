const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const uploadImage = async (file, folder = 'unimart') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary not configured. Using base64 Data URL for local development.');
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return {
      url: dataUrl,
      publicId: `mock_cloudinary_id_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(new ApiError(500, 'Image upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

const uploadImages = async (files, folder = 'unimart/products') => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadImage(file, folder)));
};

const deleteImage = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, uploadImages, deleteImage };
