// =====================================================================
// db.js - conexão com o PostgreSQL.
//
// Em desenvolvimento, aceita DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.
// Em hospedagem, aceita DATABASE_URL. DB_SSL=true habilita TLS.
// =====================================================================
const { Pool } = require('pg');

const configuracao = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'agon_hub',
};

if (process.env.DATABASE_URL) {
  configuracao.connectionString = process.env.DATABASE_URL;
}

if (process.env.DB_SSL === 'true') {
  configuracao.ssl = { rejectUnauthorized: true };
}

// Evita conexões e consultas presas indefinidamente em instâncias pequenas.
Object.assign(configuracao, {
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 20000,
  application_name: 'agon-hub-api',
});

const pool = new Pool(configuracao);

// Atalho para consultas parametrizadas.
function query(texto, parametros) {
  return pool.query(texto, parametros);
}

module.exports = { query, pool };
