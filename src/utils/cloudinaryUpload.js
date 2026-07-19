import cloudinary from "../config/cloudinaryConfig.js";

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<object>} Cloudinary upload result
 */
export const cloudinaryUploadBuffer = (fileBuffer, folder = "driver_documents") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // Automatically detect PDF, PNG, JPG, etc.
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinaryUploadBuffer;
