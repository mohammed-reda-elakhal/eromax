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
        const clients = await Client.find().sort({ createdAt: -1 });

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
*/
const createClient = asyncHandler(async (req, res) => {
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

/**
 * @desc Activate/Deactivate client account
 * @route /api/client/:id/toggle-active
 * @method PATCH
 * @access Private (client only)
 */
const toggleActiveClient = asyncHandler(async (req, res) => {
  const clientId = req.params.id;
  const client = await Client.findById(clientId);

  if (!client) {
    return res.status(404).json({ message: 'Client not found' });
  }

  client.active = !client.active;
  await client.save();

  res.status(200).json({
    message: `Cette compte est ${client.active ? 'active' : 'desactive'}`,
    client
  });
});


/**
 * @desc set  client account verified
 * @route /api/client/verify/:id
 * @method PATCH
 * @access Private (admin only)
 */
const verifyClient = asyncHandler(async (req, res) => {
  const clientId = req.params.id;
  const client = await Client.findById(clientId);

  if (!client) {
    return res.status(404).json({ message: 'Client not found' });
  }

  client.verify = true;
  await client.save();

  res.status(200).json({
    message: `Cette compte est verifier`,
    client
  });
});


const verifyClientAll = asyncHandler(async (req, res) => {
  try {
    // Update all clients by setting verify to false
    const result = await Client.updateMany({}, { verify: false });

    res.status(200).json({
      message: 'All client accounts have been set to unverified.',
      modifiedCount: result.modifiedCount, // Number of documents modified
    });
  } catch (error) {
    console.error('Error updating clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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





module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    toggleActiveClient,
    verifyClient,
    verifyClientAll
};
