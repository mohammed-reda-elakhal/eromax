const asyncHandler =require("express-async-handler");
const bcrypt = require("bcryptjs");
const { validateRegisterProfile , Profile } = require("../Models/Profile");


/** -------------------------------------------
 *@desc Register New Profile   
 * @router /api/auth/register
 * @method POST
 * @access public 
 * 
 -------------------------------------------*/

 module.exports.registerProfileCtrl= asyncHandler(async(req,res)=>{

    //input validation
    const{error}=validateRegisterProfile(req.body) ;
    if (error){
        return res.status(400).json({message:error.details[0].message});
    }


    // is profile already exist 
    let profile = await Profile.findOne({email:req.body.email});
    if(profile){
        return res.status(400).json({message:"This Profile Already Exists "});

    }
    // hash password 
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);


    //new profile - save it 
    profile = new Profile({
        username:req.body.username,
        email:req.body.email,
        CIN:req.body.CIN,
        ville:req.body.ville,
        adresse:req.body.adresse,
        password:hashPassword,
        Tel:req.body.Tel,

    });
    await profile.save();


    // send response to client
    res.status(201).json({message:"your profile registred successfully "});


 });