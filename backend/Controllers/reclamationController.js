const asyncHandler = require('express-async-handler');
const { Reclamation } = require('../Models/Reclamation');
const { Colis } = require('../Models/Colis');



/**
 * 
 */
const getReclamations = async (req, res) => {
    try {
        const { resoudre } = req.query;
        const query = {};

        if (resoudre !== undefined) {
            query.resoudre = resoudre === 'true';
        }

        const reclamations = await Reclamation.find(query)
            .populate({
                path: 'store',
                populate: {
                    path: 'id_client', // assuming 'id_client' is the reference to the client in the store schema
                    model: 'Client' // replace 'Client' with the actual name of the client model
                }
            })
            .populate('colis')
            .sort({ updatedAt: -1 });

        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reclamations', error: error.message });
    }
};


/**
 * 
 */
const getReclamationById = async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id)
        .populate('store') // Replace with actual field name if necessary
        .populate('colis')
        .sort({ updatedAt: -1 });

        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        res.status(200).json(reclamation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reclamation', error: error.message });
    }
};
/**
 * 
 */
/**
 * Create a new reclamation
 */
const createReclamation = asyncHandler(async (req, res) => {
    const { clientId, colisId, subject, description } = req.body;

    // Check for missing fields
    if (!clientId || !colisId || !subject || !description) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the colis exists
    const colis = await Colis.findById(colisId);
    if (!colis) {
        return res.status(400).json({ message: 'The selected colis does not exist.' });
    }

    // Check if the colis belongs to the client
    if (colis.store.toString() !== clientId) {
        return res.status(400).json({ message: 'The selected colis does not belong to the client.' });
    }

    const reclamation = new Reclamation({
        store: clientId,
        colis: colisId,
        subject,
        description,
    });

    await reclamation.save();
    res.status(201).json({ message: "Reclamation created successfully", reclamation });
});




/**
 * 
*/

const getReclamationByClient = asyncHandler(async (req, res) => {
    try {
        const { id_user } = req.params; 
        const reclamation = await Reclamation.find({ clientId: id_user }).sort({ createdAt: -1 }); 
        res.status(200).json(reclamation);
    } catch (e) {
        res.status(500).json({ message: 'Failed to get reclamation', error: e.message });
    }
});
/**
 * 
*/



/**
 * 
 */
const updateReclamation= asyncHandler(async(req,res)=>{
    try{
        const {subject,description}=req.body;
        let reclamation = await Reclamation.findById(req.params.id);
        if(!reclamation){
            return res.status(404).json({message:"Reclamtion not found"});
        }
        reclamation.subject = subject || reclamation.subject;
        reclamation.description = description || reclamation.description;
        await reclamation.save();
        res.status(200).json({message:"Reclamtion updated Successfully"});

    }catch(e){
        res.status(500).json({message:'Failed to update reclamation'})
    }
});


/**
 * 
 */const updateReclamationStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // ID of the reclamation from the URL parameters

        // Find the reclamation by ID
        const reclamation = await Reclamation.findById(id);

        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Update the resolu status to resolved (true)
        reclamation.resoudre = true;
        await reclamation.save(); // Save the reclamation with the updated status

        res.status(200).json({ message: 'Reclamation status updated successfully', reclamation });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update reclamation status', error: error.message });
    }
});


/**
 * 
 */
const deleteReclamtion = asyncHandler(async(req,res)=>{
    try{

        const reclamation = await Reclamation.findById(req.params.id)
        console.log(reclamation);
        if(!reclamation){
            return res.status(404).json({message:'Reclamtion not found'});
        }
        const result = await reclamation.deleteOne();
        reclamation.deleteOne();
        res.status(200).json({message: "Reclamation deleted succcessfully"});

    }catch(e){
        res.status(500).json({message:"Failed to delete Reclamation"});
    }
});


module.exports={
    getReclamations,
    getReclamationById,
    createReclamation,
    getReclamationByClient,
    deleteReclamtion,
    updateReclamation,
    updateReclamationStatus
}