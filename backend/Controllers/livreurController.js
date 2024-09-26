const asyncHandler = require("express-async-handler");
const {Livreur , livreurValidation } = require("../Models/Livreur")
const bcrypt = require("bcryptjs");
const { Store } = require("../Models/Store");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const { Colis } = require("../Models/Colis");
const { Client } = require("../Models/Client");


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
const generateFactureLivreur = async (req, res) => {
  const { colisId } = req.params; // Assuming colisId is passed as a URL parameter

  try {
    // Fetch Colis data and populate related fields
    const colis = await Colis.findById(colisId)
      .populate('livreur'); // Ensure livreur is populated

    if (!colis) {
      return res.status(404).json({ error: "Colis not found" });
    }
    console.log("colis with liv",colis.livreur.tarif);

    if (colis.statut !== "Livrée") {
      return res.status(400).json({ error: "La facture ne peut être générée que pour les colis livrés." });
    }

    const suiviColis = await Suivi_Colis.findOne({ id_colis: colisId });
    if (!suiviColis) {
      return res.status(404).json({ error: "Suivi de colis not found" });
    }

    const livraisonUpdate = suiviColis.status_updates.find(update => update.status === "Livrée");

    // Fetch Store to get the Client ID
    const storeId = colis.store;
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Fetch Client using the ID from Store
    const client = await Client.findById(store.id_client);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Ensure livreur data exists and includes the delivery fee
    const livreurTarif=colis.livreur.tarif
    console.log('liv tarif',livreurTarif);

    if (!livreurTarif) {
      return res.status(400).json({ error: "Tarif de livreur non défini" });
    }

    // Calculate the adjusted delivery fee (our fixed fee - livreur's tariff)
    const fixedDeliveryFee = 40; // Example: your fixed fee is 40
    const deliveryFee = fixedDeliveryFee - livreurTarif;

    // Ensure that the total_net does not go below zero (in case tarif exceeds fixed fee)
    const total_net = Math.max(colis.prix - deliveryFee, 0);

    // Extract necessary data for the invoice
    const factureData = {
      code_suivi: colis.code_suivi,
      date_livraison: new Date(livraisonUpdate.date).toLocaleDateString(),
      telephone: livreur.tele,
      ville: colis.ville,
      produit: colis.nature_produit,
      etat: colis.statut === "Livrée" ? "Livrée" : "En cours",
      crbt: colis.prix,
      frais_livraison: deliveryFee, // Calculated delivery fee after subtracting livreur's tariff
      total_brut: colis.prix,
      total_net: total_net, // Net total after subtracting the delivery fee
    };

    // Return the invoice data
    res.json(factureData);

  } catch (err) {
    console.error("Error generating Facture Livreur:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
const generateFactureLivreurMultiple = async (req, res) => {
  const { storeId, date } = req.params; // Assuming storeId and date are passed as URL parameters

  try {
    // Convert the provided date to start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Start of the day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // End of the day

    // Fetch all colis for the store that were delivered (status "Livrée") on the given day
    const colisList = await Colis.find({
      statut: "Livrée",
      store: storeId, // Fetch colis for the specific store
      updatedAt: { $gte: startDate, $lte: endDate } // Only colis delivered on the given day
    }).populate('livreur'); // Populate livreur details for each colis

    if (colisList.length === 0) {
      return res.status(404).json({ error: "No colis found for the store on the given day." });
    }

    // Fetch store and client data
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const client = await Client.findById(store.id_client);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Initialize totals
    let totalBrut = 0;
    let totalNet = 0;

    // Prepare facture data for each colis
    const factureItems = colisList.map(colis => {
      const livreurTarif = colis.livreur?.tarif || 0; // Get livreur's tarif or default to 0
      const frais = Math.max(40 - livreurTarif, 0); // Calculate the delivery fee, never less than 0
      const netAmount = Math.max(colis.prix - frais, 0); // Ensure net amount does not go below zero

      totalBrut += colis.prix;
      totalNet += netAmount;

      return {
        code_suivi: colis.code_suivi,
        date_livraison: new Date(colis.updatedAt).toLocaleDateString(),
        telephone: colis.livreur?.tele,
        ville: colis.ville,
        produit: colis.nature_produit,
        crbt: colis.prix,
        frais_livraison: frais, // Calculated delivery fee
        total_brut: colis.prix,
        total_net: netAmount,
        livreur: {
          nom: colis.livreur?.nom, 
          tarif: livreurTarif,
        }
      };
    });

    // Final facture data for all colis for the day
    const factureData = {
      store_name: store.nom,
      client_name: client.nom,
      client_telephone: client.tele,
      total_colis: colisList.length,
      total_brut: totalBrut,
      total_net: totalNet,
      facture_items: factureItems,
    };

    // Return the combined invoice data for the store
    res.json(factureData);

  } catch (err) {
    console.error("Error generating Facture Livreurs:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = {
  getAllLivreur,getLivreurById , createLivreur , updateLivreur , deleteLivreur,getLivreurbyVille,LivreurPhotoController,generateFactureLivreur,generateFactureLivreurMultiple
};