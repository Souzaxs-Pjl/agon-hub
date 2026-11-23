// =====================================================================
// routes/usuarios.js - administração de usuários (somente admin)
//
// Rotas (prefixo /api/usuarios):
//   GET / -> lista todos os usuários (exige token + papel admin)
//
// Esta é a primeira rota protegida por autenticar + exigirAdmin.
// Ela também serve para testar a autorização do sistema.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', autenticar, exigirAdmin, async (req, res) => {
  // Repare: NÃO selecionamos senha_hash. O hash nunca sai do servidor.
  const { rows } = await db.query(
    'SELECT id, nome, email, papel, criado_em FROM usuarios ORDER BY id'
  );
  res.json(rows);
});

module.exports = router;
