const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin , adminValidation , validateLogin } = require("../Models/Admin");
const { Client , clientValidation } = require("../Models/Client");
const { Livreur, livreurValidation } = require("../Models/Livreur");


// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1y' });
};



/** -------------------------------------------
 *@desc Register New Profile   
 * @router /api/auth/register/role
 * @method POST
 * @access public 
 -------------------------------------------*/


module.exports.registerAdmin = asyncHandler(async (req, res) => {
    const { error } = adminValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password , role , ...rest } = req.body;

    const userExists = await Admin.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    if(role != "admin"){
        return res.status(400).json({ message: "the role of user is wrong" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword, ...rest });

    await admin.save();

    res.status(201).json({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
    });
});

module.exports.registerClient = asyncHandler(async (req, res) => {
    const { error } = clientValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, role , ...rest } = req.body;
    if(role != "client"){
        return res.status(400).json({ message: "the role of user is wrong" });
    }

    const userExists = await Client.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = new Client({ email, password: hashedPassword, ...rest });

    await client.save();

    res.status(201).json({
        _id: client._id,
        email: client.email,
        role: client.role,
    });
});

module.exports.registerLivreur = asyncHandler(async (req, res) => {
    const { error } = livreurValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, role , ...rest } = req.body;
    if(role != "livreur"){
        return res.status(400).json({ message: "the role of user is wrong" });
    }

    const userExists = await Livreur.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const livreur = new Livreur({ email, password: hashedPassword, ...rest });

    await livreur.save();

    res.status(201).json({
        _id: livreur._id,
        email: livreur.email,
        role: livreur.role,
    });
});

/** -------------------------------------------
 *@desc Login Profile   
 * @router /api/auth/login
 * @method POST
 * @access public  
 -------------------------------------------*/
module.exports.loginProfileCtrl = asyncHandler(async (req, res) => {
    // Validation
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const {role} = req.params
    let user;
    if(role =="admin"){
        user = await Admin.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
    }else if(role =="client"){
        user = await Client.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
    }else if(role =="livreur"){
        user = await Livreur.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
   }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token (assuming you have a token generation logic)
    const token = generateToken(user._id, user.role);  // Replace with your token generation logic

    res.status(200).json({
        message: "Login successful",
        token,  // Include the token in the response
        user  // Optionally include the profile data
    });
});
