const asyncHandler = require("express-async-handler");
const { teamValidation, Team } = require("../Models/Team");


/** -------------------------------------------
 *@desc get list team   
 * @router /api/team
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find();
    res.status(200).json(teams);
});

/** -------------------------------------------
 *@desc get team by id 
 * @router /api/team
 * @method GET
 * @access private Only admin 
 -------------------------------------------
*/


const getTeamById = asyncHandler(async (req, res) => {
    const teamId = req.params.id;
    const team = await Team.findById(teamId);

    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
});


/** -------------------------------------------
 *@desc create new team member  
 * @router /api/team
 * @method POST
 * @access private  admin 
 -------------------------------------------
*/
const createTeam = asyncHandler(async (req, res) => {
    // Validate req body
    const { error } = teamValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Create a new team
    const team = new Team(req.body);
    await team.save();

    res.status(201).json({
        message: "Team created successfully",
        team: team
    });
});

/** -------------------------------------------
 *@desc update team   
 * @router /api/team
 * @method PUT
 * @access private  admin 
 -------------------------------------------
*/

const updateTeam = asyncHandler(async (req, res) => {
    const teamId = req.params.id;
    const updateData = req.body;

    // Validate the update data
    const { error } = teamValidation(updateData);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Find the team by ID and update
    const team = await Team.findByIdAndUpdate(teamId, updateData, { new: true });

    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({
        message: "Team updated successfully",
        team: team
    });
});
/** -------------------------------------------
 *@desc delete team   
 * @router /api/team
 * @method POST
 * @access private  admin 
 -------------------------------------------
*/

const deleteTeam = asyncHandler(async (req, res) => {
    const teamId = req.params.id;
    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
        return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({
        message: "Team deleted successfully"
    });
});








module.exports={
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamById,
    getTeams,
}
