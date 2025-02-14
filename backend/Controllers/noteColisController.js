const asyncHandler = require('express-async-handler');
const { NoteColis } = require('../Models/NoteColis'); // Adjust path as needed



/**
 * @desc    create NoteColis documents
 * @route   POST /api/note-colis
 * @access  Private (or adjust as per your route protection)
 */
module.exports.CreateNoteColisCtrl = asyncHandler(async (req, res) => {
    const { colisId } = req.body;
    if (!colisId) {
      return res.status(400).json({ message: "Missing colisId." });
    }
    // Check if a NoteColis already exists for the provided colisId
    let noteColis = await NoteColis.findOne({ colis: colisId });
    if (noteColis) {
      return res.status(200).json({ 
        message: "NoteColis already exists for this colis.", 
        noteColis 
      });
    }
    // Create an empty NoteColis document if not found
    noteColis = new NoteColis({ colis: colisId });
    await noteColis.save();
    res.status(201).json(noteColis);
  });
  

/**
 * @desc    Get all NoteColis documents
 * @route   GET /api/note-colis
 * @access  Private (or adjust as per your route protection)
 */
module.exports.GetAllNoteColisCtrl = asyncHandler(async (req, res) => {
    // Find all NoteColis documents and populate related fields
    const noteColisList = await NoteColis.find({})
      .populate('colis')  // Populate the associated Colis details
      .populate('clientNote.createdBy', 'nom prenom tele role') // Adjust fields as needed
      .populate('livreurNote.createdBy', 'nom prenom tele role')
      .populate('adminNotes.createdBy', 'nom prenom tele role');
  
    res.status(200).json(noteColisList);
  });


/**
 * @desc    Get NoteColis by Colis ID
 * @route   GET /api/note-colis/:colisId
 * @access  Private (or as per your route protection)
 */
module.exports.GetNoteColisCtrl = asyncHandler(async (req, res) => {
  const { colisId } = req.params;

  // Find the NoteColis document that corresponds to the given Colis ID
  const noteColis = await NoteColis.findOne({ colis: colisId })
    .populate('colis')  // Populate the associated Colis details
    .populate('clientNote.createdBy', 'nom prenom tele role') // Adjust fields as needed
    .populate('livreurNote.createdBy', 'nom prenom tele role')
    .populate('adminNotes.createdBy', 'nom prenom tele role');

  if (!noteColis) {
    return res.status(404).json({ message: 'NoteColis non trouvé pour ce colis.' });
  }

  res.status(200).json(noteColis);
});


/**
 * @desc    create NoteColis client
 * @route   put
 * @access  Private (or as per your route protection)
 */
module.exports.CreateOrUpdateNoteClientCtrl = asyncHandler(async (req, res) => {
    const { colisId, note } = req.body;
    if (!colisId || !note) {
      return res.status(400).json({ message: "Missing colisId or note." });
    }
    
    // Find the NoteColis document for the given colisId, or create one if it doesn't exist
    let noteColis = await NoteColis.findOne({ colis: colisId });
    if (!noteColis) {
      noteColis = new NoteColis({ colis: colisId });
    }
    
    // Get the client ID from the authenticated user
    const clientId = req.user.id;
    
    // Update the client note if it exists; otherwise, create a new one
    if (noteColis.clientNote && noteColis.clientNote.note) {
      // Update existing client note
      noteColis.clientNote.note = note;
      noteColis.clientNote.createdBy = clientId;
      noteColis.clientNote.createdAt = new Date();
    } else {
      // Create new client note
      noteColis.clientNote = {
        note,
        createdBy: clientId,
        createdAt: new Date()
      };
    }
    await noteColis.save();
    res.status(200).json(noteColis);
  });
  

  /**
 * @desc    create NoteColis livreur
 * @route   put
 * @access  Private (or as per your route protection)
 */

  module.exports.CreateOrUpdateNoteLivreurCtrl = asyncHandler(async (req, res) => {
    const { colisId, note } = req.body;
    if (!colisId || !note) {
      return res.status(400).json({ message: "Missing colisId or note." });
    }
  
    // Find the NoteColis document for the given colisId, or create one if it doesn't exist
    let noteColis = await NoteColis.findOne({ colis: colisId });
    if (!noteColis) {
      noteColis = new NoteColis({ colis: colisId });
    }
  
    // Get the livreur ID from the authenticated user
    const livreurId = req.user ? req.user.id : null;
  
    // Update the livreur note if it exists; otherwise, create a new one
    if (noteColis.livreurNote && noteColis.livreurNote.note) {
      // Update existing livreur note
      noteColis.livreurNote.note = note;
      noteColis.livreurNote.createdBy = livreurId;
      noteColis.livreurNote.createdAt = new Date();
    } else {
      // Create new livreur note
      noteColis.livreurNote = {
        note,
        createdBy: livreurId,
        createdAt: new Date()
      };
    }
  
    await noteColis.save();
    res.status(200).json(noteColis);
  });


  /**
 * @desc    create NoteColis admin
 * @route   put
 * @access  Private (or as per your route protection)
 */
  
  module.exports.CreateOrUpdateNoteAdminCtrl = asyncHandler(async (req, res) => {
    const { colisId, note } = req.body;
    if (!colisId || !note) {
      return res.status(400).json({ message: "Missing colisId or note." });
    }
  
    // Find or create the NoteColis document
    let noteColis = await NoteColis.findOne({ colis: colisId });
    if (!noteColis) {
      noteColis = new NoteColis({ colis: colisId });
    }
  
    // Get the admin ID from the authenticated user
    const adminId = req.user ? req.user.id : null;
  
    // Check if an admin note already exists for this admin
    const existingNoteIndex = noteColis.adminNotes.findIndex(adminNote => 
      adminNote.createdBy && adminNote.createdBy.toString() === adminId.toString()
    );
  
    if (existingNoteIndex !== -1) {
      // Update the existing note
      noteColis.adminNotes[existingNoteIndex].note = note;
      noteColis.adminNotes[existingNoteIndex].createdAt = new Date();
    } else {
      // Create a new admin note entry
      noteColis.adminNotes.push({
        note,
        createdBy: adminId,
        createdAt: new Date()
      });
    }
  
    await noteColis.save();
    res.status(200).json(noteColis);
  });
  