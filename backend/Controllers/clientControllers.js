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
        if (colis.statut !== "Livrée") {
            return res.status(400).json({ error: "La facture ne peut être générée que pour les colis livrés." });
        }
        const suiviColis = await Suivi_Colis.findOne({ id_colis: colisId });
        if (!suiviColis) {
            return res.status(404).json({ error: "Suivi de colis not found" });
        }
        const livraisonUpdate = suiviColis.status_updates.find(update => update.status === "Livrée");

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
        store.somme = (store.somme || 0) + factureData.total_net; // Add total_net to the existing somme

        await store.save();

        // Return the invoice data
        res.json(factureData);

    } catch (err) {
         console.error("Error generating Facture Client:", err);
    res.status(500).json({  message: "Internal server error", error: err.message });
 }
};
const generateFactureClientwithLiv = async (req, res) => {
    const { storeId, date } = req.params; // Assuming clientId and date are passed as URL parameters
    
    try {
      // Convert date parameter to start and end of the day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the day
  
      // Fetch all colis for the client that were delivered (status "Livrée") on the given day
      const colisList = await Colis.find({
        statut: "Livrée",
        store: storeId, // Fetch colis for the specific store
        updatedAt: { $gte: startDate, $lte: endDate } // Only colis updated (delivered) on the given day
      }).populate('livreur'); // Populate livreur details for each colis
  
      if (colisList.length === 0) {
        return res.status(404).json({ error: "No colis found for the client on the given day." });
      }
  
      // Fetch client data
      const store =await Store.findById(storeId)
      const client = await Client.findById(store.id_client);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
  
      // Initialize totals
      let totalBrut = 0;
      let totalNet = 0;
  
      // Prepare facture data for each colis
      const factureItems = colisList.map(colis => {
        const livreurTarif = colis.livreur?.tarif || 0; // Get livreur's tarif or default to 0
        const frais = livreurTarif; // The delivery fee is based on the livreur's tarif
        const netAmount = colis.prix - frais; // Calculate net amount by subtracting the delivery fee
        totalBrut += colis.prix;
        totalNet += netAmount;
  
        return {
          code_suivi: colis.code_suivi,
          date_livraison: new Date(colis.updatedAt).toLocaleDateString(),
          ville: colis.ville,
          produit: colis.nature_produit,
          crbt: colis.prix,
          frais: frais, // Livreurs' tarif as the fee
          total_brut: colis.prix,
          total_net: netAmount,
          livreur: {
            nom: colis.livreur?.nom , // Livreurs' name or 'N/A' if not available
            tarif: livreurTarif, // The specific tarif for the livreur
          }
        };
      });
  
      // Final facture data for the client for the day
      const factureData = {
        client_name: client.nom,
        client_telephone: client.tele,
        total_colis: colisList.length,
        total_brut: totalBrut,
        total_net: totalNet,
        facture_items: factureItems,
      };
      store.somme = (store.somme || 0) + factureData.total_net;
      console.log(store.somme);
      await store.save();
      // Return the combined invoice data for the client
      res.json(factureData);
  
    } catch (err) {
      console.error("Error generating Facture Client:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
const generateFactureClientMultiple = async (req, res) => {
    const { storeId, date } = req.params; // Assuming storeId and date are passed as URL parameters
  
    try {
      // Convert the provided date to start and end of the day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the day
  
      // Fetch all colis for the store that were delivered (status "Livrée") on the given day
      const colisList = await Colis.find({
        statut: "Livrée",
        store: storeId, // Fetch colis for the specific store
        updatedAt: { $gte: startDate, $lte: endDate } // Only colis delivered on the given day
      }).populate('livreur'); // Populate livreur details for each colis
  
      if (colisList.length === 0) {
        return res.status(404).json({ error: "No colis found for the store on the given day." });
      }
  
      // Fetch store and client data
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
  
      const client = await Client.findById(store.id_client);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
  
      // Initialize totals
      let totalBrut = 0;
      let totalNet = 0;
  
      // Prepare facture data for each colis
      const factureItems = colisList.map(colis => {
        const livreurTarif = colis.livreur?.tarif || 0; // Get livreur's tarif or default to 0
        const frais = Math.max(40 - livreurTarif, 0); // Calculate the delivery fee, never less than 0
        const netAmount = Math.max(colis.prix - frais, 0); // Ensure net amount does not go below zero
  
        totalBrut += colis.prix;
        totalNet += netAmount;
  
        return {
          code_suivi: colis.code_suivi,
          date_livraison: new Date(colis.updatedAt).toLocaleDateString(),
          telephone: colis.livreur?.tele,
          ville: colis.ville,
          produit: colis.nature_produit,
          crbt: colis.prix,
          frais_livraison: frais, // Calculated delivery fee
          total_brut: colis.prix,
          total_net: netAmount,
          livreur: {
            nom: colis.livreur?.nom, 
            tarif: livreurTarif,
          }
        };
      });
  
      // Final facture data for all colis for the day
      const factureData = {
        store_name: store.nom,
        client_name: client.nom,
        client_telephone: client.tele,
        total_colis: colisList.length,
        total_brut: totalBrut,
        total_net: totalNet,
        facture_items: factureItems,
      };
  
      // Return the combined invoice data for the store
      res.json(factureData);
  
    } catch (err) {
      console.error("Error generating Facture Livreurs:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  };
module.exports = {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    generateFactureClient,
    generateFactureClientwithLiv,
    generateFactureClientMultiple ,
};
