// =====================================================================
// routes/equipes.js - equipes (reais ou fictícias)
//
// Rotas (prefixo /api/equipes):
//   GET    /      -> lista equipes, com a modalidade    (pública)
//   GET    /:id   -> uma equipe, com a modalidade e os atletas (pública)
//   POST   /      -> cria uma equipe                     (admin)
//   PUT    /:id   -> altera uma equipe (envia todos os campos) (admin)
//   DELETE /:id   -> exclui uma equipe                   (admin)
//
// Cada equipe pertence a UMA modalidade (1:N). Os atletas de uma equipe
// vêm da tabela equipe_atletas (N:N), lida pelo GET /:id.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarEquipe } = require('../validacao');
const { limparImagemSeNaoUtilizada } = require('../arquivos');

const router = express.Router();

// SELECT base: traz a equipe junto com o nome e o tipo da modalidade.
// O JOIN ("juntar tabelas") evita o frontend ter de buscar a modalidade à parte.
const SQL_EQUIPE = `
  SELECT e.id, e.nome, e.sigla, e.sigla_oficial, e.codigo_fonte,
         e.tipo, e.instituicao, e.descricao, e.logo_url, e.slogan,
         e.instagram_url, e.titulos, e.cidade, e.responsavel, e.cores,
         e.modalidade_id, m.nome AS modalidade_nome, m.tipo AS modalidade_tipo
  FROM equipes e
  JOIN modalidades m ON m.id = e.modalidade_id
  WHERE e.demonstrativo = FALSE`;

// Busca UMA equipe com seus atletas. Devolve null se não existir.
// Usada pelo GET /:id e também pelo POST e PUT, para responder sempre
// no mesmo formato.
async function buscarEquipe(id) {
  const { rows } = await db.query(`${SQL_EQUIPE} AND e.id = $1`, [id]);
  if (rows.length === 0) return null;

  const atletas = await db.query(
    `SELECT a.id, a.nome, a.apelido, a.geracao, a.instagram_url, a.titulos,
            a.bio, a.foto_url, ea.funcao
     FROM equipe_atletas ea
     JOIN atletas a ON a.id = ea.atleta_id
     WHERE ea.equipe_id = $1 AND a.demonstrativo = FALSE AND a.perfil_publico = TRUE
     ORDER BY a.nome`,
    [id]
  );
  return { ...rows[0], atletas: atletas.rows };
}

// GET /api/equipes  (pública)
router.get('/', async (req, res) => {
  const { rows } = await db.query(`${SQL_EQUIPE} ORDER BY e.nome`);
  res.json(rows);
});

// GET /api/equipes/:id  (pública)
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const equipe = await buscarEquipe(id);
  if (!equipe) return res.status(404).json({ erro: 'Equipe não encontrada.' });
  res.json(equipe);
});

// POST /api/equipes  (admin)
// Corpo: nome, sigla, tipo ('real' | 'ficticia'), modalidade_id,
//        e opcionais instituicao, descricao, logo_url
router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarEquipe(req.body);
  if (erros.length > 0) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });

  // Se a sigla ou o nome já existir, o banco recusa (UNIQUE) e o
  // tratador de erros responde 409 com a mensagem certa.
  const { rows } = await db.query(
    `INSERT INTO equipes
       (nome, sigla, tipo, instituicao, descricao, logo_url, modalidade_id,
        slogan, instagram_url, titulos, cidade, responsavel, cores)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id`,
    [dados.nome, dados.sigla, dados.tipo, dados.instituicao, dados.descricao,
      dados.logo_url, dados.modalidade_id, dados.slogan, dados.instagram_url,
      dados.titulos, dados.cidade, dados.responsavel, dados.cores]
  );

  const equipe = await buscarEquipe(rows[0].id);
  res.status(201).json(equipe);
});

// PUT /api/equipes/:id  (admin)
router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const anterior = await db.query('SELECT logo_url FROM equipes WHERE id = $1', [id]);
  if (!anterior.rowCount) return res.status(404).json({ erro: 'Equipe não encontrada.' });

  const { erros, dados } = validarEquipe(req.body);
  if (erros.length > 0) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });

  const { rows } = await db.query(
    `UPDATE equipes
     SET nome = $1, sigla = $2, tipo = $3, instituicao = $4,
         descricao = $5, logo_url = $6, modalidade_id = $7,
         slogan = $8, instagram_url = $9, titulos = $10,
         cidade = $11, responsavel = $12, cores = $13
     WHERE id = $14
     RETURNING id`,
    [dados.nome, dados.sigla, dados.tipo, dados.instituicao, dados.descricao,
      dados.logo_url, dados.modalidade_id, dados.slogan, dados.instagram_url,
      dados.titulos, dados.cidade, dados.responsavel, dados.cores, id]
  );
  if (rows.length === 0) return res.status(404).json({ erro: 'Equipe não encontrada.' });

  await limparImagemSeNaoUtilizada(anterior.rows[0].logo_url);
  res.json(await buscarEquipe(id));
});

// DELETE /api/equipes/:id  (admin)
// Apaga também os vínculos com atletas e campeonatos (CASCADE, definido no
// schema). Se a equipe já tiver partidas, o banco recusa (RESTRICT) e a
// resposta é 409.
router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const { rows } = await db.query(
    'DELETE FROM equipes WHERE id = $1 RETURNING logo_url',
    [id]
  );
  if (rows.length === 0) return res.status(404).json({ erro: 'Equipe não encontrada.' });

  await limparImagemSeNaoUtilizada(rows[0].logo_url);
  res.json({ mensagem: 'Equipe excluída.' });
});

module.exports = router;
