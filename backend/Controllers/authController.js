const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { validateRegisterProfile, Profile, validateLoginProfile } = require("../Models/Profile");

/** -------------------------------------------
 *@desc Register New Profile   
 * @router /api/auth/register
 * @method POST
 * @access public 
 -------------------------------------------*/
module.exports.registerProfileCtrl = asyncHandler(async (req, res) => {
    // Input validation
    const { error } = validateRegisterProfile(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ email: req.body.email });
    if (profile) {
        return res.status(400).json({ message: "This Profile Already Exists " });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // New profile - save it
    profile = new Profile({
        username: req.body.username,
        email: req.body.email,
        ville: req.body.ville,
        password: hashPassword,
        Tel: req.body.Tel,
        info: {
            date_start: req.body.date_start,
            number_colis: req.body.number_colis
        }
    });
    await profile.save();

    // Send response to client
    res.status(201).json({ message: "Your profile registered successfully", profile });
});

/** -------------------------------------------
 *@desc Login Profile   
 * @router /api/auth/login
 * @method POST
 * @access public  
 -------------------------------------------*/
module.exports.loginProfileCtrl = asyncHandler(async (req, res) => {
    // Validation
    const { error } = validateLoginProfile(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const profile = await Profile.findOne({ email: req.body.email });
    if (!profile) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, profile.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token (assuming you have a token generation logic)
    const token = null;  // Replace with your token generation logic

    res.status(200).json({
        message: "Login successful",
        token,  // Include the token in the response
        profile  // Optionally include the profile data
    });
});
