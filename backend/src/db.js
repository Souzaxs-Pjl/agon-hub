// =====================================================================
// db.js - conexão com o PostgreSQL
//
// Usamos um "Pool" de conexões: em vez de abrir e fechar uma conexão a
// cada requisição, o pool mantém algumas conexões abertas e as reutiliza.
// Isso é mais rápido e é o jeito recomendado pela biblioteca "pg".
//
// IMPORTANTE: as variáveis de ambiente (DB_HOST etc.) vêm do arquivo .env.
// Quem usa este arquivo (server.js, scripts) precisa carregar o dotenv
// ANTES de fazer require('./db').
// =====================================================================
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'agon_hub',
});

// Atalho: db.query('SELECT ... WHERE id = $1', [id])
// Os valores vão separados do texto SQL ($1, $2...). É isso que protege
// contra SQL Injection: o banco nunca trata o valor como código SQL.
function query(texto, parametros) {
  return pool.query(texto, parametros);
}

module.exports = { query, pool };
