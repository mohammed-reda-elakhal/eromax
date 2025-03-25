// utils/cloudinary.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} fileToUpload - Path to the image file
 * @returns {object} - Cloudinary upload result
 */
const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: 'auto',
            folder: 'profile_photos' // Optional: organize uploads into folders
        });
        return data;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Image upload failed');
    }
};

/**
 * Remove image from Cloudinary
 * @param {string} imagePublicId - Public ID of the image to remove
 * @returns {object} - Cloudinary remove result
 */
const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return result;
    } catch (error) {
        console.error('Cloudinary Remove Error:', error);
        throw new Error('Image removal failed');
    }
};

module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage
    
};
