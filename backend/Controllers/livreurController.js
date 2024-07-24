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
   
      const livreur = await Livreur.find();
      res.json(livreur);

      if(error){
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
  if(role != "client"){
      return res.status(400).json({ message: "the role of user is wrong" });
  }

  const userExists = await Livreur.findOne({ email });
  if (userExists) {
      return res.status(400).json({ message: "Livreur already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const livreur = new Livreur({ email, password: hashedPassword, ...rest });
  const newLivreur = await livreur.save();


  res.status(201).json({
    message : `Welcom ${livreur.Prenom} to your account EROMAX`,
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
  res.json(livreur);
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

  res.json({ message: 'Client and all associated stores deleted' });
});

module.exports = {
  getAllLivreur,getLivreurById , createLivreur , updateLivreur , deleteLivreur
};