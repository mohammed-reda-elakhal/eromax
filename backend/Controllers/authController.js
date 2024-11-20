const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, validateLogin, adminValidation } = require("../Models/Admin");
const { Client , clientValidation } = require("../Models/Client");
const { Livreur, livreurValidation } = require("../Models/Livreur");
const { Store } = require("../Models/Store");
const { teamValidation, Team } = require("../Models/Team");

const generateToken = (id, role, store) => {
    return jwt.sign({ id, role, store }, process.env.JWT_SECRET, { expiresIn: '1y' });
};

/**
 * @desc Login Profile
 * @route POST /api/auth/login/:role
 * @access Public
 */
module.exports.loginProfileCtrl = asyncHandler(async (req, res) => {
    // Validation
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { role } = req.params;
    const { email, password } = req.body;
    let user;
    let token;

    // Fetch the user based on the role
    if (role === "staf") {
        user = await Admin.findOne({ email });

        // Admin can login without active check
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
    }
    else if (role === "client") {
        user = await Client.findOne({ email });

        // Check if the user is active
        if (!user || !user.active) {
            return res.status(400).json({ message: "Account is not active" });
        }
    }
    else if (role === "livreur") {
        user = await Livreur.findOne({ email });

        // Check if the user is active
        if (!user || !user.active) {
            return res.status(400).json({ message: "Account is not active" });
        }
    }
    else {
        return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user exists
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Handle client role with default store
    if (role === "client") {
        const store = await Store.findOne({ id_client: user._id, default: true });
        if (!store) {
            return res.status(400).json({ message: "No default store found for this client" });
        }
       
        token = generateToken(user._id, user.role, store._id);
        // Respond with token and user profile
        return res.status(200).json({
            message: "Login successful",
            token,
            user,
            store
        });
    } else {
        token = generateToken(user._id, user.role, "");
        // Respond with token and user profile for non-client roles
        return res.status(200).json({
            message: "Login successful",
            token,
            user
        });
    }
});

module.exports.selectStoreCtrl = asyncHandler(async (req, res) => {
    const { userId, storeId } = req.query;

    // Log received data for debugging

    // Validate the user and store
    const user = await Client.findById(userId);
    if (!user) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const store = await Store.findOne({ _id: storeId, id_client: userId });
    if (!store) {
        return res.status(400).json({ message: "Invalid store ID or store not associated with this client" });
    }

    // Generate a new token with the selected store
    const token = generateToken(user._id, user.role, store._id);

    res.status(200).json({
        message: "Store selected successfully",
        token,
        store
    });
});


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

    const { email, password , ...rest } = req.body;

    const userExists = await Admin.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const username = req.body.prenom +"_"+ req.body.nom
    const admin = new Admin({ email, password: hashedPassword, username ,  ...rest });


    await admin.save();

    res.status(201).json({
        message : `Bonjours nouveau admin`,
        _id: admin._id,
        email: admin.email,
        username:admin.username,
        role: admin.role,
    });
});

module.exports.registerClient = asyncHandler(async (req, res) => {
    const {storeName , ...clientData} = req.body
    const { error } = clientValidation(clientData);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password , ...rest } = req.body;
    const userExists = await Client.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = req.body.prenom +"_"+ req.body.nom
    const client = new Client({ email, password: hashedPassword, username , ...rest });

    await client.save();

    // create store of client
    let store = await Store.create({
        id_client : client._id,
        storeName : req.body.storeName,
        tele : client.tele ,
        default : true
    })

    // Populate the client data in store
    store = await store.populate('id_client',  ["-password"]);

    res.status(201).json({
        message : `Bonjour ${client.prenom} , votre compte sera active sur 24H`,
        role: client.role,
        store
    });
});

module.exports.registerLivreur = asyncHandler(async (req, res) => {
   

    const { email, password , ...rest } = req.body;

    const userExists = await Livreur.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = req.body.prenom +"_"+ req.body.nom
    const livreur = new Livreur({ email, password: hashedPassword , username , ...rest });

    await livreur.save();

    res.status(201).json({
        message : `Bonjour ${livreur.prenom} , Votre compte sera activée sur 24H  `,
        _id: livreur._id,
        email: livreur.email,
        role: livreur.role,
    });
});


module.exports.registerTeam = asyncHandler(async (req, res) => {
    const { error } = teamValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password , ...rest } = req.body;

    const userExists = await Team.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = req.body.prenom +"_"+ req.body.nom
    const team = new Team({ email, password: hashedPassword, username , ...rest });

    await team.save();

    res.status(201).json({
        message : `Welcom ${team.prenom} to your account EROMAX`,
        _id: team._id,
        email: team.email,
        username ,
        role: team.role,
    });
});
