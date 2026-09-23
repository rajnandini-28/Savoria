// Cloudinary Configuration Placeholder & Fallback
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'savoria-dining',
    api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret'
};

const uploadToCloudinary = async (fileBuffer, folder = 'savoria/dishes') => {
    // In production, uses cloudinary.uploader.upload_stream
    return {
        secure_url: `/assets/dishes/dish_${Date.now()}.jpg`,
        public_id: `savoria_${Date.now()}`
    };
};

module.exports = {
    cloudinaryConfig,
    uploadToCloudinary
};
