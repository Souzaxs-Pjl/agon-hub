const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/api", apiRoutes);

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada"
    });
});

module.exports = app;