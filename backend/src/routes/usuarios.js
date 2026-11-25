// =====================================================================
// routes/usuarios.js - consulta administrativa e perfis públicos.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId } = require('../validacao');

const router = express.Router();

// Perfis públicos mostram somente informações escolhidas para divulgação.
// E-mail, papel e dados de acesso nunca são retornados aqui.
router.get('/:id/publico', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const { rows } = await db.query(
    `SELECT u.id, u.nome, u.bio, u.foto_url, u.criado_em,
            a.id AS atleta_id
     FROM usuarios u
     LEFT JOIN atletas a ON a.usuario_id = u.id
     WHERE u.id = $1 AND u.perfil_publico = TRUE`,
    [id]
  );
  if (!rows.length) {
    return res.status(404).json({ erro: 'Perfil não encontrado ou definido como privado.' });
  }
  res.json(rows[0]);
});

router.get('/', autenticar, exigirAdmin, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, nome, email, papel, criado_em FROM usuarios ORDER BY id'
  );
  res.json(rows);
});

module.exports = router;
