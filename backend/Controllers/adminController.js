const asyncHandler = require("express-async-handler");
const { adminValidation, Admin } = require("../Models/Admin");
const { Client } = require("../Models/Client");
const { Livreur } = require("../Models/Livreur");


// Helper to pick model by role
const modelByRole = (role) => {
    if (role === 'client') return Client;
    if (role === 'livreur') return Livreur;
    return null;
};

// Allowed statuses for API keys
const ALLOWED_STATUSES = ['inactive','pending_verification','active','suspended','revoked','expired'];

/**
 * @desc Toggle API key status between 'active' and 'inactive' for client/livreur
 * @route PATCH /api/admin/api-key/:role/:id/toggle
 * @access Private (admin only)
 */
const toggleApiKeyStatus = asyncHandler(async (req, res) => {
    const { role, id } = req.params;
    const Model = modelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const doc = await Model.findById(id).select('+apiSecretHash');
    if (!doc) return res.status(404).json({ message: `${role} not found` });

    // Basic guardrails: require keyId/apiKey to exist before activation
    if ((!doc.keyId || !doc.apiKey) && doc.status !== 'inactive') {
        // normalize inconsistent state to inactive
        doc.status = 'inactive';
    }

    let nextStatus;
    if (doc.status === 'active') {
        nextStatus = 'inactive';
        doc.activatedAt = undefined;
    } else {
        // Only allow activation if apiKey and keyId exist
        if (!doc.apiKey || !doc.keyId) {
            return res.status(409).json({ message: 'Cannot activate: missing apiKey/keyId' });
        }
        nextStatus = 'active';
        doc.activatedAt = new Date();
        doc.revokedAt = undefined;
        doc.expiresAt = doc.expiresAt; // keep as-is if you have expirations
    }

    doc.status = nextStatus;
    await doc.save();

    return res.status(200).json({
        message: `API key ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        userId: doc._id,
        role,
        status: doc.status,
        keyId: doc.keyId,
        apiKey: doc.apiKey,
        activatedAt: doc.activatedAt,
    });
});

/**
 * @desc Set API key status explicitly for client/livreur
 * @route PATCH /api/admin/api-key/:role/:id/status
 * @body { status }
 * @access Private (admin only)
 */
const setApiKeyStatus = asyncHandler(async (req, res) => {
    const { role, id } = req.params;
    const { status } = req.body || {};
    const Model = modelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role' });
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const doc = await Model.findById(id).select('+apiSecretHash');
    if (!doc) return res.status(404).json({ message: `${role} not found` });

    // Business rules for transitions
    if (status === 'active') {
        if (!doc.apiKey || !doc.keyId) {
            return res.status(409).json({ message: 'Cannot activate: missing apiKey/keyId' });
        }
        doc.activatedAt = new Date();
        doc.revokedAt = undefined;
    }
    if (status === 'revoked' || status === 'suspended') {
        doc.revokedAt = new Date();
    }
    if (status === 'inactive') {
        doc.activatedAt = undefined;
    }

    doc.status = status;
    await doc.save();

    return res.status(200).json({
        message: `API key status updated to ${status}`,
        userId: doc._id,
        role,
        status: doc.status,
        keyId: doc.keyId,
        apiKey: doc.apiKey,
        activatedAt: doc.activatedAt,
        revokedAt: doc.revokedAt,
    });
});


/** -------------------------------------------
 *@desc get list admin   
 * @router /api/admin
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/
const getAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json(admin);
});

/** -------------------------------------------
 *@desc get Admin by id 
 * @router /api/admin
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/


const getAdminById = asyncHandler(async (req, res) => {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(admin);
});


/**
 * @desc Activate/Deactivate admin account
 * @route /api/admin/active/:id
 * @method PATCH
 * @access Private (admin only)
 */
const toggleActiveAdmin = asyncHandler(async (req, res) => {
    const adminID = req.params.id;
    const admin = await Admin.findById(adminID);
  
    if (!admin) {
      return res.status(404).json({ message: 'admin not found' });
    }
  
    admin.active = !admin.active;
    await admin.save();
  
    res.status(200).json({
      message: `Cette compte est ${admin.active ? 'active' : 'desactive'}`,
      admin
    });
  });
  

/** -------------------------------------------
 *@desc create new Admin member  
 * @router /api/admin
 * @method POST
 * @access private  admin 
 -------------------------------------------
*/
const createAdmin = asyncHandler(async (req, res) => {
    // Validate req body
    const { error } = adminValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Create a new team
    const admin = new Admin(req.body);
    await admin.save();

    res.status(201).json({
        message: "Admin created successfully",
        team: admin
    });
});

/** -------------------------------------------
 *@desc update Admin   
 * @router /api/admin
 * @method PUT
 * @access private  admin 
 -------------------------------------------
*/

const updateAdmin = asyncHandler(async (req, res) => {
    const adminId = req.params.id;
    const updateData = req.body;

    // Find the team by ID and update
    const admin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true });

    if (!admin) {
        return res.status(404).json({ message: "Admin not Exist" });
    }

    res.status(200).json({
        message: "Admin est modifier",
        admin
    });
});


/** -------------------------------------------
 *@desc delete Admin   
 * @router /api/admin
 * @method POST
 * @access private  admin 
 -------------------------------------------
*/

const deleteAdmin = asyncHandler(async (req, res) => {
    const adminId = req.params.id;
    const admin = await Admin.findByIdAndDelete(adminId);

    if (!admin) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({
        message: "Admin deleted successfully"
    });
});

// Controller to update the message of super admin by _id from params
const updateSuperAdminMessage = asyncHandler(async (req, res) => {
    const superAdminId = req.params.id; // Get the super admin's _id from request parameters
    const { message } = req.body; // The message that needs to be updated

    // Check if the message is provided
    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    // Find the super admin by _id
    const superAdmin = await Admin.findById(superAdminId);

    // If no super admin is found, return an error
    if (!superAdmin) {
        return res.status(404).json({ message: "Super admin not found" });
    }

    // Update the super admin's message
    superAdmin.message = message;

    // Save the updated super admin document
    await superAdmin.save();

    // Respond with the updated message
    res.status(200).json({
        message: "Super admin message updated successfully",
        messageAdmin: superAdmin.message // Return the updated message field
    });
});



// Controller to get the message of super admin by _id from params
const getSuperAdminMessage = asyncHandler(async (req, res) => {
    const superAdminId = req.params.id; // Get the super admin's _id from request parameters

    // Find the super admin by _id
    const superAdmin = await Admin.findById(superAdminId).select('message'); // Only select the message field

    // If no super admin is found, return an error
    if (!superAdmin) {
        return res.status(404).json({ message: "Super admin not found" });
    }

    // Respond with the super admin message
    res.status(200).json({
        message: "Super admin message fetched successfully",
        messageAdmin: superAdmin.message // Return the message field
    });
});








module.exports={
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminById,
    getAdmin,
    getSuperAdminMessage ,
    updateSuperAdminMessage,
    toggleActiveAdmin,
    // API key admin controls
    toggleApiKeyStatus,
    setApiKeyStatus
    
}
