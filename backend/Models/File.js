const mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({

  type: {
    type: String,
    enum: ['CIN', 'Passport', 'Other'], // Types possibles
    default: 'CIN', // Par défaut, c'est "CIN"
    required: true,
  },
  userType: {
    type: String,
    enum: ['client', 'livreur'], 
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  cinRecto: {
    url: { type: String, required: true }, // L'URL du fichier recto
    publicId: { type: String, required: true }, // ID public pour Cloudinary ou autre service
  },
  cinVerso: {
    url: { type: String, required: true }, // L'URL du fichier verso
    publicId: { type: String, required: true }, // ID public pour Cloudinary ou autre service
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
