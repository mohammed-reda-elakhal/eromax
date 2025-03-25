const Meth_Payement = require('../Models/Meth_Payement');
const asyncHandler =require('express-async-handler');
const { cloudinaryUploadImage } = require('../utils/cloudinary');
const path = require('path')
const fs =require('fs');
const Payement = require('../Models/Payement');


const createMeth = async (req, res) => {
    try {
        const { bank } = req.body;
        
        // Validate bank name
        if (!bank || typeof bank !== 'string' || bank.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Bank name is required and must be a non-empty string' 
            });
        }

        // Validate image upload
        if (!req.file) {
            return res.status(400).json({ 
                error: 'Bank image is required' 
            });

        }

        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ 
                error: 'Uploaded file must be an image' 
            });
        }

        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        
        // Upload the image to Cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        // Check error during upload
        if (result instanceof Error) {
            return res.status(500).json({ 
                error: 'Failed to upload image to Cloudinary', 
                details: result.message 
            });
        }

        // Create a new Meth_Payement with the image URL and public_id
        const newMethPayement = new Meth_Payement({
            Bank: bank.trim(),
            image: {
                url: result.secure_url,
                public_id: result.public_id

            }
        });

        const savedMethPayement = await newMethPayement.save();
        
        // Remove the local file after upload
        try {
            fs.unlinkSync(imagePath);
        } catch (err) {
            console.error("Failed to delete local image:", err);
        }

        res.status(201).json(savedMethPayement);
    } catch (error) {
        console.error('Error in createMeth:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to create payment method',
            details: error.stack
        });
    }
};

// Get all bank payment methods
const getAllMethPayements = asyncHandler(async (req, res) => {
    try {
        const methPayements = await Meth_Payement.find().sort({ createdAt: -1 });
        res.status(200).json(methPayements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a bank payment method by ID
const getMethPayementById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const methPayement = await Meth_Payement.findById(id);
        

        if (!methPayement) {
            return res.status(404).json({ message: 'Bank payment method not found' });
        }

        res.status(200).json(methPayement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const updateMethPayement = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { bank } = req.body;

        // Find the existing payment method
        const existingMethPayement = await Meth_Payement.findById(id);
        if (!existingMethPayement) {
            return res.status(404).json({ message: 'Bank payment method not found' });
        }

        // If a new image is uploaded, handle the upload and deletion of the old image
        if (req.file) {
            // Upload the new image to Cloudinary
            const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
            const result = await cloudinaryUploadImage(imagePath);

            if (result instanceof Error) {
                return res.status(500).json({ error: 'Failed to upload image to Cloudinary', details: result.message });
            }


            // Update the image fields
            existingMethPayement.image.url = result.secure_url;
            existingMethPayement.image.public_id = result.public_id;

            // Remove the local file after upload
            try {
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.error("Failed to delete local image:", err);
            }
        }

        // Update the bank name if provided
        if (bank) {
            existingMethPayement.Bank = bank;
        }

        // Save the updated payment method
        const updatedMethPayement = await existingMethPayement.save();
        res.status(200).json(updatedMethPayement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a bank payment method
const deleteMethPayement = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMethPayement = await Meth_Payement.findByIdAndDelete(id);

        if (!deletedMethPayement) {
            return res.status(404).json({ message: 'Bank payment method not found' });
        }
        // Delete all payments that were made using this payment method
        await Payement.deleteMany({ idBank: id });

        res.status(200).json({ message: 'Bank payment method deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports={

    createMeth,
    getAllMethPayements,
    getMethPayementById,
    updateMethPayement,
    deleteMethPayement
}

