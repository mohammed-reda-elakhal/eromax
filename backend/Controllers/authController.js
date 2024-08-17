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
 * @access public
 */
module.exports.loginProfileCtrl = asyncHandler(async (req, res) => {
    // Validation
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { role } = req.params;
    const { email, password ,username} = req.body;
    let user;
    let token;

    // Fetch the user based on the role
    if (role === "admin") {
        user = await Admin.findOne({ email });
    }
    else if(role === "team") {
        user = await Team.findOne({ email });
    } 
    else if (role === "client") {
        user = await Client.findOne({ email });
    } 
    else if (role === "livreur") {
        user = await Livreur.findOne({ email });
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

    // Handle client role with multiple stores
    if (role === "client") {
        const stores = await Store.find({ id_client: user._id });
        if (!stores || stores.length === 0) {
            return res.status(400).json({ message: "No stores associated with this client" });
        }

        if (stores.length === 1) {
            // If client has only one store, log in with that store
            token = generateToken(user._id, user.role, stores[0]._id);
            return res.status(200).json({
                message: "Login successful",
                token,
                user,
                store: stores[0]
            });
        } else {
            // If client has multiple stores, return the list of stores
            return res.status(200).json({
                message: "Login successful. Please select a store.",
                user,
                stores: stores.map(store => ({ id: store._id, name: store.name }))
            });
        }
    } else {
        token = generateToken(user._id, user.role, "");
    }

    // Respond with token and user profile
    res.status(200).json({
        message: "Login successful",
        token,
        user
    });
});

module.exports.selectStoreCtrl = asyncHandler(async (req, res) => {
    const { userId, storeId } = req.body;

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

    const { email, password,username  , ...rest } = req.body;

    const userExists = await Admin.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword,username,...rest });

    await admin.save();

    res.status(201).json({
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
    const client = new Client({ email, password: hashedPassword, ...rest });

    await client.save();

    // create store of client
    let store = await Store.create({
        id_client : client._id,
        storeName : req.body.storeName
    })

    // Populate the client data in store
    store = await store.populate('id_client',  ["-password"]);

    res.status(201).json({
        message : `Welcom ${client.Prenom} to your account EROMAX`,
        role: client.role,
        store
    });
});

module.exports.registerLivreur = asyncHandler(async (req, res) => {
    const { error } = livreurValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password , ...rest } = req.body;

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
    const team = new Team({ email, password: hashedPassword, ...rest });

    await team.save();

    res.status(201).json({
        _id: team._id,
        email: team.email,
        role: team.role,
    });
});

