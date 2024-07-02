const asyncHandler = require('express-async-handler');
const Store = require('../models/Store');
//---------------------------------------------------------------------------------------------------
// Get all stores
const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find().populate('id_client');
  res.json(stores);
});

//---------------------------------------------------------------------------------------------------
// Get a store by ID
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('id_client');
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json(store);
});

//---------------------------------------------------------------------------------------------------
// Create a new store
const createStore = asyncHandler(async (req, res) => {
  const store = new Store(req.body);
  const newStore = await store.save();
  res.status(201).json(newStore);
});

//---------------------------------------------------------------------------------------------------
// Update a store
const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json(store);
});

//---------------------------------------------------------------------------------------------------
// Delete a store
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findByIdAndDelete(req.params.id);
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json({ message: 'Store deleted' });
});

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};
