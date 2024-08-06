const asyncHandler = require('express-async-handler');
<<<<<<< HEAD
const {Store} = require('../Models/Store');
const path = require("path")
const fs = require("fs")
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require("../utils/cloudinary");

=======
const {Store} = require('../models/Store');
const path = require("path")
const fs = require("fs")
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require("../utils/cloudinary")
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada




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

/**
 * @desc Update-photo-Controller
 * @router /api/store/:id/photo
 * @method POST
 * @access private client
 */
 
 const storePhotoController= asyncHandler(async(req,res)=>{

  console.log('Inside storePhotoController controller');
  //Validation 
  if(!req.file){
    return req.status(400).json({message:"no file provided"});
  }
  //2. get image path 
  const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
  //3. Upload to cloudinary
  const result= await cloudinaryUploadImage(imagePath)
  console.log(result);
  //4. Get the store from db
  const store= await Store.findById(req.params.id);
  //5. Delete the old profile photo if exists 
  if(store.image.publicId !== null){
    await cloudinaryRemoveImage(store.image.publicId);

  }
  //6. change image url in DB
  store.image={
    url:result.secure_url,
    publicId : result.public_id
  }
  await store.save();
  //7. send response to client 
  res.status(200).json({ message: 'Photo successfully uploaded', image: store.image });


  //8. Remove Image from the server 
  fs.unlinkSync(imagePath);


 });

module.exports = {
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  createStores,
<<<<<<< HEAD
  storePhotoController
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
};
