const asyncHandler = require('express-async-handler');
const Produit = require('../models/Produit');

// Get all produits
const getAllProduits = asyncHandler(async (req, res) => {
  const produits = await Produit.find();
  res.json(produits);
});

// Get a produit by ID
const getProduitById = asyncHandler(async (req, res) => {
  const produit = await Produit.findById(req.params.id);
  if (!produit) {
    res.status(404).json({ message: 'Produit not found' });
    return;
  }
  res.json(produit);
});

// Create a new produit
const createProduit = asyncHandler(async (req, res) => {
  const produit = new Produit(req.body);
  const newProduit = await produit.save();
  res.status(201).json(newProduit);
});

// Update a produit
const updateProduit = asyncHandler(async (req, res) => {
  const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!produit) {
    res.status(404).json({ message: 'Produit not found' });
    return;
  }
  res.json(produit);
});

// Delete a produit
const deleteProduit = asyncHandler(async (req, res) => {
  const produit = await Produit.findByIdAndDelete(req.params.id);
  if (!produit) {
    res.status(404).json({ message: 'Produit not found' });
    return;
  }
  res.json({ message: 'Produit deleted' });
});

module.exports = {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit
};
