// =====================================================================
// routes/modalidades.js - esportes e jogos eletrônicos
//
// Rotas (prefixo /api/modalidades):
//   GET    /      -> lista modalidades           (pública)
//   GET    /:id   -> uma modalidade              (pública)
//   POST   /      -> cria                       (admin)
//   PUT    /:id   -> altera (envia todos os campos) (admin)
//   DELETE /:id   -> exclui                     (admin)
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarModalidade } = require('../validacao');

const router = express.Router();

// Colunas devolvidas ao cliente (repetidas em vários lugares de propósito,
// para o arquivo ser fácil de ler sozinho).
const COLUNAS = 'id, nome, tipo, descricao';

router.get('/', async (req, res) => {
  const { rows } = await db.query(`SELECT ${COLUNAS} FROM modalidades ORDER BY nome`);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const { rows } = await db.query(`SELECT ${COLUNAS} FROM modalidades WHERE id = $1`, [id]);
  if (rows.length === 0) return res.status(404).json({ erro: 'Modalidade não encontrada.' });
  res.json(rows[0]);
});

router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarModalidade(req.body);
  if (erros.length > 0) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });

  const { rows } = await db.query(
    `INSERT INTO modalidades (nome, tipo, descricao) VALUES ($1, $2, $3) RETURNING ${COLUNAS}`,
    [dados.nome, dados.tipo, dados.descricao]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const { erros, dados } = validarModalidade(req.body);
  if (erros.length > 0) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });

  const { rows } = await db.query(
    `UPDATE modalidades SET nome = $1, tipo = $2, descricao = $3
     WHERE id = $4 RETURNING ${COLUNAS}`,
    [dados.nome, dados.tipo, dados.descricao, id]
  );
  if (rows.length === 0) return res.status(404).json({ erro: 'Modalidade não encontrada.' });
  res.json(rows[0]);
});

router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  // Se ainda houver equipes ou campeonatos usando a modalidade, o banco
  // recusa (RESTRICT) e o tratador de erros responde 409.
  const { rowCount } = await db.query('DELETE FROM modalidades WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ erro: 'Modalidade não encontrada.' });
  res.json({ mensagem: 'Modalidade excluída.' });
});

module.exports = router;
