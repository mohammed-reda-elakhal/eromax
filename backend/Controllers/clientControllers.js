const asyncHandler = require("express-async-handler");
const {Client, clientValidation} = require("../Models/Client");
const bcrypt = require("bcryptjs");
const { Store } = require("../models/Store");


/** -------------------------------------------
 *@desc get list client   
 * @router /api/client
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/

const getAllClients = asyncHandler(async (req, res) => {
   
      const clients = await Client.find();
      res.json(clients);

      if(error){
        res.status(500).json({ message: error.message });
      }
     
    
  });

/** -------------------------------------------
 *@desc get client by id   
 * @router /api/client/:id
 * @method GET
 * @access private  admin or client hem self
 -------------------------------------------
*/

const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.json(client);
});

/** -------------------------------------------
 *@desc create new client and store by default   
 * @router /api/client
 * @method POST
 * @access private  admin or client hem self
 -------------------------------------------
*/

const createClient = asyncHandler(async (req, res) => {
  const {storeName , ...clientData} = req.body
  const {error} = clientValidation(clientData)
  if(error){
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
  const newClient = await client.save();
  

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


/** -------------------------------------------
 *@desc update client    
 * @router /api/client/:id
 * @method PUT
 * @access private  only client hem self
 -------------------------------------------
*/


const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!client) {
    res.status(404).json({ message: 'Client not found' });
    return;
  }
  res.json(client);
});
/** -------------------------------------------
 *@desc Delete client    
 * @router /api/client/:id
 * @method DELETE
 * @access private  admin or client himself
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
  deleteClient
};