const express = require('express');
const router = express.Router();
const { createTeam, updateTeam, getTeamById, deleteTeam, getTeams } = require("../Controllers/teamController")
// Route to create a new team
router.route("/")
        .get(getTeams)
        .post(createTeam)


// Route to update a team by ID
router.route("/:id")
        .put(updateTeam)
        .get(getTeamById)
        .delete(deleteTeam)

module.exports= router