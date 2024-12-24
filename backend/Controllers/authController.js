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

        /**

            user{
                nom .......
                store :{
                    
                }
            }
        
         */
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
     // Validate the request body
     const { error } = adminValidation(req.body);
     if (error) {
         return res.status(400).json({ message: error.details[0].message });
     }
 
     const { email, password, ...rest } = req.body;
 
     // Check if the user already exists by email
     const userExists = await Admin.findOne({ email });
     if (userExists) {
         return res.status(400).json({ message: "User already exists" });
     }
 
     // Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);
 
     // Generate username from the first name and last name
     const username = req.body.prenom + "_" + req.body.nom;
 
     // Check if this is the first admin being created
     const adminCount = await Admin.countDocuments();
     const permission = adminCount === 0 ? 'all' : 'none';  // First admin gets 'all' permissions
     const type = adminCount === 0 ? 'super' : 'normal';    // First admin is 'super', others are 'normal'
 
     // Create a new admin instance
     const admin = new Admin({
         email,
         password: hashedPassword,
         username,
         permission,  // Set permission based on whether this is the first admin
         type,         // Set type based on whether this is the first admin
         ...rest
     });
 
     // Save the new admin to the database
     await admin.save();
 
     // Return the response with the admin's details
     res.status(201).json({
         message: `Bonjours nouveau admin`,
         _id: admin._id,
         email: admin.email,
         username: admin.username,
         role: admin.role,
         permission: admin.permission,
         type: admin.type  // Include the type in the response
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
        message : `Bonjour ${client.prenom} , Votre compte est créer`,
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
        message : `Bonjour ${livreur.prenom} , Votre compte est créer !!`,
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


module.exports.resetUserPasswordCtrl = asyncHandler(async (req, res) => {
    const {userId, newPassword } = req.body;
    const { role } = req.params; // Récupérer le rôle depuis les paramètres


    // Vérifier si l'utilisateur authentifié est un admin
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Accès interdit, seul un administrateur peut réinitialiser les mots de passe" });
    }

    let user;

    // Identifier l'utilisateur en fonction de son rôle
    if (role === "staf") {
        user = await Admin.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé pour le rôle 'staf'" });
        }
    } else if (role === "client") {
        user = await Client.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé pour le rôle 'client'" });
        }
    } else if (role === "livreur") {
        user = await Livreur.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé pour le rôle 'livreur'" });
        }
    } else {
        return res.status(400).json({ message: "Rôle invalide" });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: `Le mot de passe de l'utilisateur a été réinitialisé avec succès`,
        email: user.email,
    });
});

module.exports.resetOwnPasswordCtrl = asyncHandler(async (req, res) => {
    const {newPassword } = req.body; // Récupérer l'ancien et le nouveau mot de passe depuis le corps de la requête
    const { id, role } = req.user; // Extraire l'ID et le rôle depuis le token
    let user;

    // Identifier l'utilisateur en fonction de son rôle
    if (role === "staf") {
        user = await Admin.findById(id);
    } else if (role === "client") {
        user = await Client.findById(id);
    } else if (role === "livreur") {
        user = await Livreur.findById(id);
    } else {
        return res.status(400).json({ message: "Rôle invalide" });
    }

    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: "Votre mot de passe a été mis à jour avec succès",
    });
});



