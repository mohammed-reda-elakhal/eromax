const asyncHandler =require("express-async-handler");
const {Colis, validateRegisterColis}= require("../Models/Colis");


//Add Colis 
module.exports.CreateColisCtrl= asyncHandler(async(req,res)=>{

    if(!req.body){
        return res.status(400).json({message:"Les donnees de votre colis est manquant"});
    }
    //input validation
    const{error}=validateRegisterColis(req.body) ;
        if (error){
            return res.status(400).json({message:error.details[0].message});
        }
    
    const newColis = new Colis(req.body);
    const saveColis = await newColis.save();
    res.status(201).json(saveColis);

    });
//--------------------------------------------------------------------------
//get All Colis
module.exports.getAllColisCtrl= asyncHandler(async(req,res)=>{
        
    const colis = await Colis.find();
    res.status(200).json(colis);

});
//-------------------------------------------------------------------------

//get Colis by code suivi 
module.exports.getColisByIdCtrl=asyncHandler(async(req,res)=>{
    const colis = await Colis.findById(req.params.id);
    if(!colis){
        return res.status(404).json({message:"Colis not found"});

    }
    res.status(200).json(colis);
})
//-----------------------------------------------------
//update Colis
module.exports.updateColis= asyncHandler(async(req,res)=>{
    //input validation 
    const {error}=validateRegisterColis(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    
    }
    const updatedColis = await Colis.findByIdAndUpdate(req.params.code_suivi,req.body,{new:true} );
    if(!updatedColis){
        return res.status(404).json({message:"Colis not found"});

    }
    res.status(200).json(updatedColis);
})
//-------------------------------------------------------------------
//get colis by code suivi 
exports.getColisByCodeSuiviCtrl = asyncHandler(async (req, res) => {
    const colis = await Colis.findOne({ code_suivi: req.params.code_suivi });
    if (!colis) {
        return res.status(404).json({ message: "Colis not found" });
    }
    res.status(200).json(colis);
});
//-----------------------------------------------------
//Delete Colis 
module.exports.deleteColis= asyncHandler(async(req,res)=>{
    const deletedColis = await Colis.findByIdAndDelete(req.params.id);
    if(!deletedColis){
        return res.status(404).json({message:"Colis not found"});

    }
    res.status(200).json({message:"Colis deleted succesfully"});
});