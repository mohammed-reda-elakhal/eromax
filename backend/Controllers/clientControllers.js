const asyncHandler = require("express-async-handler");
const { Client, clientValidation } = require("../Models/Client");
const bcrypt = require("bcryptjs");
const { Store } = require("../Models/Store");
const path = require("path");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const fs = require("fs");
const File = require("../Models/File");
const { Colis } = require("../Models/Colis");
const { Suivi_Colis } = require("../Models/Suivi_Colis");

/** -------------------------------------------
 * @desc get list of clients along with their stores
 * @router /api/client
 * @method GET
 * @access private Only admin
 -------------------------------------------
*/
const getAllClients = asyncHandler(async (req, res) => {
    try {
        // Fetch all clients
        const clients = await Client.find();

        // Fetch stores for each client
        const clientsWithStores = await Promise.all(
            clients.map(async (client) => {
                const stores = await Store.find({ id_client: client._id });
                return {
                    ...client._doc, // Use _doc to get the actual client data
                    stores
                };
            })
        );

        res.json(clientsWithStores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/** -------------------------------------------
 * @desc get client by id along with their stores
 * @router /api/client/:id
 * @method GET
 * @access private admin or client himself
 -------------------------------------------
*/
const getClientById = asyncHandler(async (req, res) => {
    try {
        // Fetch client by ID
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Fetch stores associated with the client
        const stores = await Store.find({ id_client: client._id });

        // Combine client data with stores
        const clientWithStores = {
            ...client._doc, // Use _doc to get the actual client data
            stores
        };

        res.json(clientWithStores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



/** -------------------------------------------
 * @desc create new client and store by default
 * @router /api/client
 * @method POST
 * @access private admin or client himself
 -------------------------------------------
*/const createClient = asyncHandler(async (req, res) => {
    const { storeName, ...clientData } = req.body;

    // Validate client data using Joi
    const { error } = clientValidation(clientData);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, role } = clientData;

    if (role !== "client") {
        return res.status(400).json({ message: "The role of user is wrong" });
    }

    const userExists = await Client.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Create a unique username using prenom and nom
    const username = clientData.prenom + "_" + clientData.nom;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new client
    const client = new Client({ ...clientData, password: hashedPassword, username });
    const newClient = await client.save();

    // Create the client's store
    let store = await Store.create({
        id_client: client._id,
        storeName : req.body.storeName,
        default : true
    });

    // Populate the client data in the store response
    store = await store.populate('id_client', ["-password"]);

    res.status(201).json({
        message: `Compte de ${client.prenom} est Prêt`,
        role: client.role,
        store
    });
});


/** -------------------------------------------
 * @desc update client
 * @router /api/client/:id
 * @method PUT
 * @access private only client himself
 -------------------------------------------
 */
 const updateClient = asyncHandler(async (req, res) => {
    const updateData = req.body;
    const clientId = req.params.id;

    const client = await Client.findByIdAndUpdate(clientId, updateData, { new: true });
    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }
    
    res.status(200).json({ message: "Client updated Successfully", client });
});


/** -------------------------------------------
 * @desc delete client
 * @router /api/client/:id
 * @method DELETE
 * @access private admin or client himself
 -------------------------------------------
*/
const deleteClient = asyncHandler(async (req, res) => {
    const client = await Client.findById(req.params.id);
    if (!client) {
        res.status(404).json({ message: 'Client not found' });
        return;
    }

    // Delete all stores associated with the client
    await Store.deleteMany({ id_client: client._id });

    // Delete the client
    await client.deleteOne();

    res.json({ message: 'Client and all associated stores deleted' });
});

/** -------------------------------------------
 * @desc Upload client photo
 * @router /api/client/photo/:id
 * @method POST
 * @access private
 -------------------------------------------
*/
const clientPhotoController = asyncHandler(async (req, res) => {
    console.log('Inside clientPhotoController controller');
    // Validation 
    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    // 2. get image path 
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    const client = await Client.findById(req.params.id);
    if (!client) {
        return res.status(404).json({ message: "Client not found" });
    }
    // 4. Get the store from db
    // 5. Delete the old profile photo if exists 
    if (client.profile.publicId !== null) {
        await cloudinaryRemoveImage(client.profile.publicId);
    }
    // 6. change image url in DB
    client.profile = {
        url: result.secure_url,
        publicId: result.public_id
    };
    await client.save();
    // 7. send response to client 
    res.status(200).json({ message: 'Photo successfully uploaded', image: client.profile });

    // 8. Remove Image from the server 
    fs.unlinkSync(imagePath);
});

/** -------------------------------------------
 * @desc Upload client files
 * @router /api/client/file/:id
 * @method POST
 * @access private
 -------------------------------------------
*/
const UploadClientFiles = asyncHandler(async (req, res) => {
    console.log("Received file upload request");

    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }

    try {
        const clientId = req.params.id;
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        const imagePath = path.join(__dirname, `../files/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        console.log(result);
        if (!result) {
            console.error("Failed to upload file to Cloudinary:", JSON.stringify(result.error));
            return res.status(500).json({ message: "Failed to upload file to Cloudinary", error: result.error });
        }
        const file = new File({
            filename: req.file.filename,
            contentType: req.file.mimetype,
            path: result.secure_url,
            publicId: result.public_id
        });

        await file.save();

        // Add file reference to client
        client.files.push(file._id);
        await client.save();

        // Remove file from server after uploading to Cloudinary
        fs.unlinkSync(imagePath);
        console.log("File uploaded to Cloudinary and saved to DB:", JSON.stringify(file));

        res.status(200).json({ message: "File uploaded successfully", fileId: file._id });
    } catch (err) {
        console.error("Error uploading file", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});
const generateFactureClient = async (req, res) => {
    const { colisId } = req.params; // Assuming colisId is passed as a URL parameter

    try {
        // Fetch Colis data and populate related fields
        const colis = await Colis.findById(colisId)
            //.populate('produits.produit') // Ensure these fields are correctly defined in the schema
            .populate('livreur'); // Ensure these fields are correctly defined in the schema

        if (!colis) {
            return res.status(404).json({ error: "Colis not found" });
        }
        console.log(colis);
        if (colis.statut !== "livrée") {
            return res.status(400).json({ error: "La facture ne peut être générée que pour les colis livrés." });
        }
        const suiviColis = await Suivi_Colis.findOne({ id_colis: colisId });
        if (!suiviColis) {
            return res.status(404).json({ error: "Suivi de colis not found" });
        }
        const livraisonUpdate = suiviColis.status_updates.find(update => update.status === "livrée");

        // Fetch Store to get the Client ID
        const storeId= colis.store
         const store = await Store.findById(storeId); // Assuming `id_store` is the reference in Colis

       if (!store) {
            return res.status(404).json({ error: "Store not found" });
        }

        // Fetch Client using the ID from Store
        const client = await Client.findById(store.id_client);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        // Extract necessary data for the invoice
        const factureData = {
            code_suivi: colis.code_suivi,
            date_livraison: new Date(livraisonUpdate.date).toLocaleDateString(),
            telephone: client.tele,
            ville: colis.ville,
            produit: colis.nature_produit,
            etat: colis.statut === "livré" ? "Livré" : "En cours",
            crbt: colis.prix,
            frais: 40, // Assuming this is a fixed fee
            total_brut: colis.prix,
            total_net: colis.prix - 40, // Subtract fixed fee from total price
        };

        // Return the invoice data
        res.json(factureData);

    } catch (err) {
         console.error("Error generating Facture Client:", err);
    res.status(500).json({  message: "Internal server error", error: err.message });
 }
};

module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    clientPhotoController,
    UploadClientFiles,
    generateFactureClient
};
