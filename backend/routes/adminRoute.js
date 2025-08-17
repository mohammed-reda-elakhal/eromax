const express = require('express');
const router = express.Router();
const { createAdmin, updateAdmin, getAdminById, deleteAdmin, getAdmin, updateSuperAdminMessage, getSuperAdminMessage, toggleActiveAdmin, toggleApiKeyStatus, setApiKeyStatus } = require("../Controllers/adminController")
const { verifyTokenAndAdmin } = require("../Middlewares/VerifyToken");

// Route to create a new team
router.route("/")
        .get(getAdmin)
        .post(createAdmin)

// Route to update a team by ID
// name/api/admin/:id
router.route("/:id")
        .put(updateAdmin)
        .get(getAdminById)
        .delete(deleteAdmin)

router.route('/message/:id')
        .patch(updateSuperAdminMessage)

router.route("/active/:id")
        .patch(toggleActiveAdmin)

router.route('/message/:id')       
        .get(getSuperAdminMessage)


// API key lifecycle controls (admin)
// e.g. PATCH /api/admin/api-key/client/:id/toggle
router.patch('/api-key/:role/:id/toggle', verifyTokenAndAdmin, toggleApiKeyStatus)
// e.g. PATCH /api/admin/api-key/client/:id/status { status }
router.patch('/api-key/:role/:id/status', verifyTokenAndAdmin, setApiKeyStatus)



module.exports= router