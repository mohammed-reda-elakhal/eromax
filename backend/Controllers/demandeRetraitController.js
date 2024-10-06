// controllers/demande_retour.controller.js
const DemandeRetrait = require('../Models/Demande_Retrait');

exports.createDemandeRetrait = async (req, res) => {
  try {
    const demandeRetrait = new DemandeRetrait(req.body);
    await demandeRetrait.save();
    res.status(201).json(demandeRetrait);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDemandesRetrait = async (req, res) => {
  try {
    const demandes = await DemandeRetrait.find().populate('id_store id_payement');
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
