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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: function (req, file, cb) {
// Check file type
    if(file.mimetype.startsWith("file")){
      cb(null , true)
  }else{
      cb({message : "Unsupported this file type"} , false)
  }
    
  }
});

module.exports = fileUpload