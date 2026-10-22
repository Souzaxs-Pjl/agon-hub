const express = require("express");

const {
    getTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} = require("../controllers/teamsController");

const {
    autenticarToken,
    exigirPapel
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getTeams);
router.get("/:id", getTeamById);

router.post(
    "/",
    autenticarToken,
    exigirPapel("admin"),
    createTeam
);

router.put(
    "/:id",
    autenticarToken,
    exigirPapel("admin"),
    updateTeam
);

router.delete(
    "/:id",
    autenticarToken,
    exigirPapel("admin"),
    deleteTeam
);

module.exports = router;