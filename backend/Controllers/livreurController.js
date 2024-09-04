const asyncHandler = require("express-async-handler");
const {Livreur , livreurValidation } = require("../Models/Livreur")
const bcrypt = require("bcryptjs");


/** -------------------------------------------
 *@desc get list livreur   
 * @router /api/livreur
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/

const getAllLivreur = asyncHandler(async (req, res) => {
  try {
    const livreurs = await Livreur.find();
    res.json(livreurs); // Send the response with the list of livreurs
  } catch (error) {
    // If an error occurs, send a 500 status with the error message
    res.status(500).json({ message: error.message });
  }
});

/** -------------------------------------------
 *@desc get livreur by id   
 * @router /api/livreur/:id
 * @method GET
 * @access private  admin or livreur hem self
 -------------------------------------------
*/

const getLivreurById = asyncHandler(async (req, res) => {
  const livreur = await Livreur.findById(req.params.id);
  if (!livreur) {
    res.status(404).json({ message: 'Livreur not found' });
    return;
  }
  res.json(livreur);
});

/** -------------------------------------------
 *@desc create new livreur   
 * @router /api/livreur
 * @method POST
 * @access private  admin or livreur hem self
 -------------------------------------------
*/

const createLivreur = asyncHandler(async (req, res) => {
  const {error} = livreurValidation(req.body)
  if(error){
    return res.status(400).json({ message: error.details[0].message });
  }


  const { email, password, role , ...rest } = req.body;
  if(role != "livreur"){
      return res.status(400).json({ message: "the role of user is wrong" });
  }

  const userExists = await Livreur.findOne({ email });
  if (userExists) {
      return res.status(400).json({ message: "Livreur already exists" });
  }
  const username = req.body.prenom + "_" + req.body.nom
  const hashedPassword = await bcrypt.hash(password, 10);
  const livreur = new Livreur({ email, password: hashedPassword, username , ...rest });
  const newLivreur = await livreur.save();


  res.status(201).json({
    message : `Welcom ${livreur.prenom} to your account EROMAX`,
    role: livreur.role,
  });
});


/** -------------------------------------------
 *@desc update livreur    
 * @router /api/livreur/:id
 * @method PUT
 * @access private  only livreur hem self
 -------------------------------------------
*/


const updateLivreur = asyncHandler(async (req, res) => {
  const livreur = await Livreur.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!livreur) {
    res.status(404).json({ message: 'Livreur not found' });
    return;
  }
  res.json({ message: "Profile updated Successfully", Livreur: livreur });
});
/** -------------------------------------------
 *@desc Delete livreur    
 * @router /api/livreur/:id
 * @method DELETE
 * @access private  admin or livreur himself
 -------------------------------------------
*/
const deleteLivreur = asyncHandler(async (req, res) => {
  const livreur = await Livreur.findById(req.params.id);
  
  if (!livreur) {
    res.status(404).json({ message: 'livreur not found' });
    return;
  }

  
  // Delete the client
  await livreur.deleteOne();

  res.json({ message: 'Livreur est suppremer' });
});




const getLivreurbyVille= asyncHandler(async(req,res)=>{

  const {ville}= req.body;
  if(!ville){
    return res.status(400).json({message:"Ville is required"})
  }
  console.log("Receiving request");

  const livreurs = await Livreur.find({ville:ville});

  if(livreurs.length===0){
    return res.status(404).json({message:'No livreurs Found in this ville'});

  }
  res.status(200).json({message:'Livreurs fetched Successfully',livreurs:livreurs});




});
const LivreurPhotoController = asyncHandler(async (req, res) => {
  console.log('Inside clientPhotoController controller');
  // Validation 
  if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
  }

  // 2. get image path 
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  // 3. Upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);
  console.log(result);

  const livreur = await Livreur.findById(req.params.id);
  if (!livreur) {
      return res.status(404).json({ message: "livreur not found" });
  }
  // 4. Get the livreur  from db
  // 5. Delete the old profile photo if exists 
  if (livreur.profile.publicId !== null) {
      await cloudinaryRemoveImage(livreur.profile.publicId);
  }
  // 6. change image url in DB
  livreur.profile = {
      url: result.secure_url,
      publicId: result.public_id
  };
  await livreur.save();
  // 7. send response to client 
  res.status(200).json({ message: 'Photo successfully uploaded', image: livreur.profile });

  // 8. Remove Image from the server 
  fs.unlinkSync(imagePath);
});
module.exports = {
  getAllLivreur,getLivreurById , createLivreur , updateLivreur , deleteLivreur,getLivreurbyVille,LivreurPhotoController
};