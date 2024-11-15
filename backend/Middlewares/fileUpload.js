// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null , path.join(__dirname , "../files")); // Folder to save the uploaded files
  },
  filename: function (req, file, cb) {
    if(file){
      cb(null , new Date().toISOString().replace(/:/g,"-") + file.originalname )
  }else{
      cb(null , false)
  }
  }
});

// Initialize upload variable
const fileUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

module.exports = fileUpload