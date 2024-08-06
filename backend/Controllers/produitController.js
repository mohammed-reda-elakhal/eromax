const asyncHandler = require("express-async-handler");
const { Produit, validateProduit } = require("../Models/Produit");
<<<<<<< HEAD
const { default: mongoose } = require("mongoose");
const { Variante } = require("../Models/Variante");
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada

/** -------------------------------------------
 *@desc create produit  
 * @router /api/produit/:id_client
 * @method POST
 * @access private client hem self 
 -------------------------------------------
*/
const createProduit = asyncHandler(async (req, res) => {
    const { error } = validateProduit(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let { nom, image, categorie, quantite, variants, etat } = req.body;

    const id_client = req.user.id
    // If variants are provided, calculate the quantite as the sum of all variant stocks
    if (variants && variants.length > 0) {
        quantite = variants.reduce((total, variant) => total + variant.stock, 0);
    }

    const produit = new Produit({
        id_client,
        nom,
        image,
        categorie,
        quantite,
        variants,
        etat,
    });

    await produit.save();
    res.status(201).json(produit);
});

/** -------------------------------------------
 *@desc get all produits
 * @router /api/produit
 * @method POST
 * @access private only admin
 -------------------------------------------
*/
const getAllProduit = asyncHandler(async (req, res) => {
    const produits = await Produit.find().populate('id_client',["-password"])
    res.status(201).json(produits);
});


/** -------------------------------------------
 *@desc get produit by client
 * @router /api/produit/:id_client
 * @method POST
 * @access private admin and client hem self
 -------------------------------------------
*/
const getProduitByClient = asyncHandler(async (req, res) => {
    const produits = await Produit.find({id_client : req.user.id}).populate('id_client',["-password"])
    if(!produit){
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(201).json(produits);
});

/** -------------------------------------------
 *@desc get produit by id
 * @router /api/produit/:id_client
 * @method POST
 * @access private admin and client hem self
 -------------------------------------------
*/
const getProduitById = asyncHandler(async (req, res) => {
    const produits = await Produit.findById(req.params.id).populate('id_client',["-password"])
    if(!produits){
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(201).json(produits);
});


/** -------------------------------------------
 *@desc update produit information
 * @router /api/produit/:id
 * @method PUT
 * @access private client hem self
 -------------------------------------------
*/
const updateProduit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the product by ID and ensure it belongs to the authenticated client
    let produit = await Produit.findOne({ _id: id });
    if (!produit) {
        return res.status(404).json({ message: "Product not found or you are not authorized to update this product" });
    }

    // Update the product fields
    produit.nom = req.body.nom || produit.nom;
    produit.image = req.body.image || produit.image;
    produit.categorie = req.body.categorie || produit.categorie;
    produit.variants = req.body.variants || produit.variants;
    produit.etat = req.body.etat !== undefined ? req.body.etat : produit.etat;

    // If variants are provided, calculate the quantite as the sum of all variant stocks
    if (req.body.variants && req.body.variants.length > 0) {
        produit.quantite = req.body.variants.reduce((total, variant) => total + variant.stock, 0);
    }

    // Save the updated product
    produit = await produit.save();

    res.status(200).json(produit);
});
<<<<<<< HEAD
 
const createProduitVariantes = asyncHandler(async (req, res) => {
    const { error } = validateProduit(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { nom, image, categorie, quantite, variants, etat } = req.body;
    const id_client = req.body.id_client;

    try {
        // Create the product
        const produit = new Produit({
            id_client,
            nom,
            image,
            categorie,
            quantite:Number(quantite),
            etat,
            variants
        });
        
        
        // If variants are provided, calculate the quantite as the sum of all variant stocks
        if (produit.variants && produit.variants.length > 0) {
            produit.quantite = variants.reduce((total, variant) => total + variant.stock, 0);
        }

        // Save the product
        const savedProduit = await produit.save();

        // Create and save the variants
        if (variants && variants.length > 0) {
            const variantDocuments = variants.map(variant => ({
                id_produit: savedProduit._id,
                nom_variante: variant.name,
                quantite: variant.stock
            }));
            
            const savedVariants = await Variante.insertMany(variantDocuments);

            // Update the product with the created variants
            savedProduit.variants = savedVariants.map(variant => variant._id);
            await savedProduit.save();
        }

       

        res.status(201).json(savedProduit);
    } catch (error) {
     
        res.status(500).json({ message: "An error occurred while creating the product and its variants", error: error.message });
    }
});
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada


/** -------------------------------------------
 *@desc update produit quantity
 * @router /api/produit/stock/:id
 * @method PUT
 * @access private client hem self
 -------------------------------------------
*/

const updateProduitQuantity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { variantId, quantityChange } = req.body;

    // Log the received input for debugging purposes
    console.log("Received input:", { variantId, quantityChange });

    // Validate the input
    if (typeof quantityChange !== 'number') {
        return res.status(400).json({ message: "Quantity change must be a number" });
    }

    // Find the product by ID and ensure it belongs to the authenticated client
    let produit = await Produit.findOne({ _id: id});
    if (!produit) {
        return res.status(404).json({ message: "Product not found or you are not authorized to update this product" });
    }

    // Update the product quantity
    if (variantId) {
        // If a variant ID is provided, update the specific variant's stock
        const variant = produit.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        variant.stock += quantityChange;

        // Ensure stock doesn't go negative
        if (variant.stock < 0) {
            return res.status(400).json({ message: "You dont have stock in this variant" });
        }

        // Recalculate the total product quantity
        produit.quantite = produit.variants.reduce((total, variant) => total + variant.stock, 0);
    } else {
        // If no variant ID is provided, update the general product quantity
        produit.quantite += quantityChange;

        // Ensure quantity doesn't go negative
        if (produit.quantite < 0) {
            return res.status(400).json({ message: "You don't have stock in product" });
        }
    }

    // Save the updated product
    await produit.save();

    res.status(200).json(produit);
});



/** -------------------------------------------
 *@desc delete produit 
 * @router /api/produit/:id
 * @method DELETE
 * @access private admin and client hem self
 -------------------------------------------
*/
const deleteProduit = asyncHandler(async (req, res) => {
    const produit = await Produit.findOneAndDelete(req.params.id)
    if(!produit){
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(201).json({message : "your Product is Deleted with success"});
});

module.exports = { 
    createProduit ,
    getAllProduit ,
    getProduitByClient , 
    updateProduit , 
    updateProduitQuantity,
    deleteProduit, 
<<<<<<< HEAD
    getProduitById,
    createProduitVariantes
=======
    getProduitById
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
};
