const express=require("express");
const { getAllVariantes, createVariante, updateVariante, deleteVariante } = require("../Controllers/varianteController");
const router = express.Router()



router.route("/").get(getAllVariantes);
router.post('/', createVariante);



// Update a variant by ID
router.put('/:id', updateVariante);

// Delete a variant by ID
router.delete('/:id', deleteVariante);





module.exports=router