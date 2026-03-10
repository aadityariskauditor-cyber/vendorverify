const { Readable } = require('stream');
const { v2: cloudinary } = require('cloudinary');

const provider = process.env.FILE_STORAGE_PROVIDER || 'cloudinary';

if (provider === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const streamUploadToCloudinary = (file, folder = 'vendor-documents') =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

const uploadFile = async (file, folder) => {
  if (provider !== 'cloudinary') {
    throw new Error('Unsupported FILE_STORAGE_PROVIDER. Configure "cloudinary".');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are missing.');
  }

  return streamUploadToCloudinary(file, folder);
};

module.exports = {
  uploadFile
};
