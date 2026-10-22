const express = require("express");

const {
    registrar,
    entrar,
    obterPerfil
} = require("../controllers/authController");

const {
    autenticarToken
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registrar);

router.post("/login", entrar);

router.get("/me", autenticarToken, obterPerfil);

module.exports = router;