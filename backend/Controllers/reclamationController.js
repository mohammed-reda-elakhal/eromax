const asyncHandler = require('express-async-handler');
const { Reclamation } = require('../Models/Reclamation');



/**
 * 
 */
const getReclamations = async (req, res) => {
    try {
        const reclamations = await Reclamation.find()
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
        const reclamation = await Reclamation.findById(req.params.id);

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
const createReclamation = asyncHandler(async(req,res)=>{

    try{
        const {clientId,subject,description}=req.body;
        const reclamation =new Reclamation({
            clientId,
            subject,
            description
        });
        await reclamation.save();
        res.status(201).json({message:"Reclamation  created Successfully",reclamation});


    }catch(err){
        res.status(500).json({message:'Failed to create reclamation',error:err.message});


    }

});

/**
 * 
*/

const getReclamationByClient = asyncHandler(async (req, res) => {
    try {
        const { id_user } = req.params; 
        const reclamation = await Reclamation.find({ clientId: id_user }); 
        res.status(200).json(reclamation);
    } catch (e) {
        res.status(500).json({ message: 'Failed to get reclamation', error: e.message });
    }
});
/**
 * 
*/

const getReclamtionById= asyncHandler(async(req,res)=>{
    try{
        const reclamation = await Reclamation.findById(req.params.id);
        if(!reclamation){
            return res.status(404).json({message:"Reclamtion not found"});

        }
        res.status(200).json(reclamation);
    }catch(e){
        res.status(500).json({message:'Failed to get reclamation'});

    }
});

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
 */
const updateReclamationStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        //const { resolu } = req.body;

        // Find the reclamation by ID
        const reclamation = await Reclamation.findById(id);

        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Update the resolu status
        reclamation.resolu = true;
        await reclamation.save();

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
        if(reclamation.resolu){  
            console.log('before deleting');
            const result = await reclamation.deleteOne();
            console.log('Deletion result:', result);
            reclamation.deleteOne();
            console.log(reclamation._id);
            res.status(200).json({message: "Reclamation deleted succcessfully"});
        }else{
            return res.status(400).json({ message: 'Cannot delete a reclamation that is not resolved' });
        }

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