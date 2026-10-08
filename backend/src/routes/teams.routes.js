const express = require("express");

const {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} = require("../controllers/teamsController");

const router = express.Router();

// GET /api/teams
router.get("/", getTeams);

// GET /api/teams/:id
router.get("/:id", getTeamById);

// POST /api/teams
router.post("/", createTeam);

// PUT /api/teams/:id
router.put("/:id", updateTeam);

// DELETE /api/teams/:id
router.delete("/:id", deleteTeam);

module.exports = router;