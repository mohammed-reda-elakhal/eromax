const asyncHandler = require("express-async-handler");
const { adminValidation, Admin } = require("../Models/Admin");


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








module.exports={
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminById,
    getAdmin,
}
