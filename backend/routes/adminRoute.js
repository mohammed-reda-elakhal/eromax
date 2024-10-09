const express = require('express');
const router = express.Router();
const { createAdmin, updateAdmin, getAdminById, deleteAdmin, getAdmin } = require("../Controllers/adminController")
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

module.exports= router