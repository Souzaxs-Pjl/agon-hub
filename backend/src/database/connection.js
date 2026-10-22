const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "agon_hub",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    max: 10
});

function consultar(sql, parametros = []) {
    return pool.query(sql, parametros);
}

module.exports = { pool, consultar };
