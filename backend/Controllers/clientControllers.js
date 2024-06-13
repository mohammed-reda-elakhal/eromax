const asyncHandler = require("express-async-handler");
const {Client} = require("../Models/Client");

//------------------------------------------------------------------------------------------------------
//get all client 
const getAllClients = asyncHandler(async (req, res) => {
   
      const clients = await Client.find().populate('id_client');
      res.json(clients);

      if(error){
        res.status(500).json({ message: error.message });
      }
     
    
  });

//------------------------------------------------------------------------------------------------------
//get Client by ID

const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate('id_client');
  if (!client) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.json(client);
});
//------------------------------------------------------------------------------------------------------
//create client
const createClient = asyncHandler(async (req, res) => {
  const client = new Client(req.body);
  const newClient = await client.save();
  res.status(201).json(newClient);
});
//------------------------------------------------------------------------------------------------------

// Update a client
const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!client) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.json(client);
});
//------------------------------------------------------------------------------------------------------
// Delete a client
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.json({ message: 'Client deleted' });
});

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};