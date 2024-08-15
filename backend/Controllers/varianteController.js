const asyncHandler = require("express-async-handler");
const { Variante } = require("../Models/Variante");



/** -------------------------------------------
 * @desc Create a new variant
 * @route POST /api/variante
 * @access Private
 -------------------------------------------*/
 const createVariante = asyncHandler(async (req, res) => {
    const { id_produit, nom_variante, quantite } = req.body;

    try {
        const variante = new Variante({
            id_produit,
            nom_variante,
            quantite
        });

        const savedVariante = await variante.save();
        res.status(201).json(savedVariante);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while creating the variant", error: error.message });
    }
});
/** -------------------------------------------
 * @desc Get all variants
 * @route GET /api/variante
 * @access Private
 -------------------------------------------*/
 const getAllVariantes = asyncHandler(async (req, res) => {
    try {
        const variantes = await Variante.find().populate('id_produit', ['-password']);
        res.status(200).json(variantes);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching variants", error: error.message });
    }
});


const updateVariante = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nom_variante, quantite } = req.body;

    try {
        const variante = await Variante.findById(id);
        if (!variante) {
            return res.status(404).json({ message: "Variant not found" });
        }

        variante.nom_variante = nom_variante || variante.nom_variante;
        variante.quantite = quantite || variante.quantite;

        const updatedVariante = await variante.save();
        res.status(200).json(updatedVariante);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the variant", error: error.message });
    }
});

/** -------------------------------------------
 * @desc Get variants by product ID
 * @route GET /api/variante/by-product/:id_produit
 * @access Private
 -------------------------------------------*/
const getVariantsByProductId = asyncHandler(async (req, res) => {
    const { id_produit } = req.params;

    try {
        // Fetch variants by product ID
        const variants = await Variante.find({ id_produit });
        if (!variants.length) {
            return res.status(404).json({ message: "No variants found for this product" });
        }
        res.status(200).json(variants);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the variants", error: error.message });
    }
});
/** -------------------------------------------
 * @desc Delete a variant
 * @route DELETE /api/variante/:id
 * @access Private
 -------------------------------------------*/
 const deleteVariante = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const variante = await Variante.findByIdAndDelete(id);
        if (!variante) {
            return res.status(404).json({ message: "Variant not found" });
        }
        res.status(200).json({ message: "Variant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the variant", error: error.message });
    }
});


module.exports={
    createVariante,
    getAllVariantes,
    getVariantsByProductId,
    deleteVariante,
    updateVariante
}
