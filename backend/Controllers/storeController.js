const asyncHandler = require('express-async-handler');
const {Store} = require('../models/Store');




/** -------------------------------------------
 *@desc create new store    
 * @router /api/store
 * @method POST
 * @access private  only user hem self
 -------------------------------------------
*/
const createStores = asyncHandler(async (req, res) => {
  let store = await Store.create({
    id_client : req.user.id,
    storeName : req.body.storeName
  })
  res.json(store);
});


/** -------------------------------------------
 *@desc get list store    
 * @router /api/store
 * @method GET
 * @access private  only admin
 -------------------------------------------
*/
const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find().populate('id_client')
  res.json(stores);
});

/** -------------------------------------------
 *@desc get store by id    
 * @router /api/store/:id
 * @method GET
 * @access private  admin and client hem self
 -------------------------------------------
*/
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('id_client');
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json(store);
});


/** -------------------------------------------
 *@desc update store    
 * @router /api/store/:id
 * @method PUT
 * @access private  only client hem self
 -------------------------------------------
*/
const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json(store);
});


/** -------------------------------------------
 *@desc delete store    
 * @router /api/store/:id
 * @method DELETE
 * @access private  only client hem self
 -------------------------------------------
*/

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
  updateStore,
  deleteStore,
  createStores
};
