const { Withdrawal } = require('../Models/Withdrawal');
const { cloudinaryUploadImage } = require('../utils/cloudinary');
const asyncHandler = require('express-async-handler');

const uploadVermentPreuve = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the withdrawal by ID
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        // Handle image upload
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        console.log('Uploading verment preuve...');
        const uploadResult = await cloudinaryUploadImage(req.file.path);
        console.log('Upload result:', uploadResult);

        // Update the verment_preuve field
        withdrawal.verment_preuve = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
        };

        await withdrawal.save();

        res.status(200).json({
            message: 'Proof of payment uploaded successfully',
            verment_preuve: withdrawal.verment_preuve
        });
    } catch (error) {
        console.error('Error in uploadVermentPreuve:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    uploadVermentPreuve
};
