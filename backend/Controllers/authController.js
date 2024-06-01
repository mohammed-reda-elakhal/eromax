const asyncHandler =require("express-async-handler");
const bcrypt = require("bcryptjs");
const { validateRegisterProfile , Profile , validateLoginProfile} = require("../Models/Profile");


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
        ville:req.body.ville,
        password:hashPassword,
        Tel:req.body.Tel,
        info: {
            date_start: req.body.date_start,
            number_colis : req.body.number_colis
        }
    });
    await profile.save();

    // send response to client
    res.status(201).json({message:"your profile registred successfully " , profile});
 });

 
 /** -------------------------------------------
 *@desc Login Profile   
 * @router /api/auth/login
 * @method POST
 * @access public 
 * 
 -------------------------------------------*/

 module.exports.registerProfileCtrl= asyncHandler(async(req,res)=>{
    // validation
    const {error} = validateLoginProfile(req.body)
    if(error){
        return res.status(400).json({message : error.details[0].message })
    }

    const profile = await Profile.findOne({email : req.body.email});
    if(!profile){
        return res.status(400).json({message : "invalid name or password"})
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password , profile.password)
    if(!isPasswordMatch){
        return res.status(400).json({message : "invalid name or password"})
    }

    const token = null ;

    res.status(200).json({
        
    })

 })