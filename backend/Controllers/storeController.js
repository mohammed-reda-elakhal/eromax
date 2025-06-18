const asyncHandler = require('express-async-handler');
const {Store} = require('../Models/Store');
const {Wallet} = require('../Models/Wallet');
const Payement = require('../Models/Payement');
const {Colis} = require('../Models/Colis');
const path = require("path")
const fs = require("fs")
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require("../utils/cloudinary");





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
    storeName : req.body.storeName,
    default : false
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
  const storeId = req.params.id;
  const requestingUser = req.user;

  const store = await Store.findById(storeId).populate('id_client');
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }

  // Authorization check: Only allow users to access their own stores or admins to access any
  if (requestingUser.role !== 'admin' && store.id_client._id.toString() !== requestingUser.id) {
    return res.status(403).json({ message: 'Access denied. You can only view your own stores.' });
  }

  // Get wallet data related to this store
  const wallet = await Wallet.findOne({ store: storeId });
  
  // Get payment data related to this store's client
  const payments = await Payement.find({ clientId: store.id_client._id }).populate('idBank');

  // Get colis counts for different statuses
  const colisCounts = await Promise.all([
    // Total colis count
    Colis.countDocuments({ store: storeId }),
    // Livrée (Delivered) count
    Colis.countDocuments({ store: storeId, statut: "Livrée" }),
    // Annulée (Cancelled) count
    Colis.countDocuments({ store: storeId, statut: "Annulée" }),
    // Refusée (Refused) count
    Colis.countDocuments({ store: storeId, statut: "Refusée" })
  ]);

  // Combine all data in the response
  const response = {
    store: store,
    wallet: wallet || null,
    payments: payments || [],
    colisStats: {
      total: colisCounts[0],
      livree: colisCounts[1],
      annulee: colisCounts[2],
      refusee: colisCounts[3]
    }
  };

  res.json(response);
});


/** -------------------------------------------
 *@desc get store by user    
 * @router /api/store/user/:id
 * @method GET
 * @access private  admin and client hem self
 -------------------------------------------
*/
const getStoreByUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const requestingUser = req.user;

  // Authorization check: Only allow users to access their own stores or admins to access any
  if (requestingUser.role !== 'admin' && requestingUser.id !== userId) {
    return res.status(403).json({ message: 'Access denied. You can only view your own stores.' });
  }

  // Find the store where id_client matches the userId
  const stores = await Store.find({ id_client: userId }).populate('id_client');

  // Return empty array if no stores found (this is normal for new users)
  res.status(200).json(stores);
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

/**
 * @desc Upload and update store image
 * @route PUT /api/store/:id/photo
 * @method PUT
 * @access Private (client)
 */
const storePhotoController = asyncHandler(async (req, res) => {
  console.log('Inside storePhotoController controller');

  // Validation 
  if (!req.file) {
    return res.status(400).json({ message: "No file provided" });
  }

  try {
    // 2. Get image path 
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    // 3. Upload to Cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    // 4. Get the store from DB
    const store = await Store.findById(req.params.id);
    if (!store) {
      // Remove uploaded image from Cloudinary if store not found
      await cloudinaryRemoveImage(result.public_id);
      return res.status(404).json({ message: "Store not found" });
    }

    // 5. Delete the old profile photo if exists 
    if (store.image && store.image.publicId) {
      await cloudinaryRemoveImage(store.image.publicId);
    }

    // 6. Change image URL in DB
    store.image = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await store.save();

    // 7. Send response to client 
    res.status(200).json({ message: 'Photo successfully uploaded', store });

    // 8. Remove Image from the server 
    fs.unlinkSync(imagePath);

  } catch (error) {
    console.error('Error in storePhotoController:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const resetAutoDR = asyncHandler(async (req, res) => {
  try {
      // Update all documents in the Store collection
      const result = await Store.updateMany({}, { $set: { auto_DR: false } });

      // Respond with success
      res.status(200).json({
          message: 'Successfully reset auto_DR attribute to false for all stores.',
          modifiedCount: result.modifiedCount,
      });
  } catch (error) {
      // Log the error and respond with a server error message
      console.error("Error resetting auto_DR for all stores:", error.message);
      res.status(500).json({
          message: 'Server error occurred while resetting auto_DR for all stores.',
          error: error.message,
      });
  }
});

// storeController.js

const toggleAutoDR = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Find the store by ID
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Toggle the auto_DR value
    store.auto_DR = !store.auto_DR;

    // Save the updated store
    await store.save();

    return res.status(200).json({
      message: "auto_DR toggled successfully",
      auto_DR: store.auto_DR
    });
  } catch (error) {
    console.error("Error toggling auto_DR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  createStores,
  getStoreByUser,
  storePhotoController,
  resetAutoDR,
  toggleAutoDR 
};
