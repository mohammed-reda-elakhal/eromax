const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { validateRegisterProfile , Profile } = require("../Models/Profile");


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

    const { email, password  , ...rest } = req.body;

    const userExists = await Admin.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
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

