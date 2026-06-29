const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const uploadImage = async (buffer, folder = 'unimart') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError(503, 'Image upload service is not configured');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(new ApiError(500, 'Image upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const uploadImages = async (files, folder = 'unimart/products') => {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => uploadImage(file.buffer, folder)));
};

const deleteImage = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, uploadImages, deleteImage };
