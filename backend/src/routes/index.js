const express = require("express");

const teamsRoutes = require("./teams.routes");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "AGON Hub API está funcionando!",
        status: "online"
    });
});

router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "AGON Hub API"
    });
});

router.use("/teams", teamsRoutes);

module.exports = router;