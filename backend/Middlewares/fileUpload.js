// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to sanitize filenames
const sanitizeFilename = (filename) => {
  return filename.replace(/[:]/g, '-').replace(/\s+/g, '_');
};

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../files");

    // Ensure the 'files' directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // Folder to save the uploaded files
  },
  filename: function (req, file, cb) {
    if (file) {
      const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons with hyphens
      const sanitizedOriginalName = sanitizeFilename(file.originalname);
      const finalFilename = `${timestamp}-${sanitizedOriginalName}`;
      cb(null, finalFilename);
    } else {
      cb(null, false);
    }
  }
});

// Initialize upload variable with enhanced configuration
const fileUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file type" }, false);
    }
  }
}).fields([
  { name: 'cinRecto', maxCount: 1 },
  { name: 'cinVerso', maxCount: 1 }
]);

module.exports = fileUpload;
