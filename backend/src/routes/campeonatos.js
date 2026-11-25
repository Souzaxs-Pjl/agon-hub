// =====================================================================
// routes/campeonatos.js - CRUD de campeonatos e inscrições de equipes.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarCampeonato } = require('../validacao');

const router = express.Router();

const FROM_CAMPEONATO = `
  FROM campeonatos c
  JOIN modalidades m ON m.id = c.modalidade_id
  LEFT JOIN LATERAL (
    SELECT CASE
      WHEN p.placar_casa > p.placar_visitante THEN p.equipe_casa_id
      WHEN p.placar_visitante > p.placar_casa THEN p.equipe_visitante_id
      ELSE NULL
    END AS equipe_id
    FROM partidas p
    WHERE p.campeonato_id = c.id
      AND p.status = 'finalizada'
      AND p.demonstrativo = FALSE
      AND p.placar_casa IS NOT NULL
      AND p.placar_visitante IS NOT NULL
      AND p.placar_casa <> p.placar_visitante
      AND p.fase ILIKE '%final%'
    ORDER BY p.data_hora DESC NULLS LAST, p.id DESC
    LIMIT 1
  ) vencedor ON TRUE
  LEFT JOIN equipes campeao ON campeao.id = vencedor.equipe_id
`;

async function buscarCampeonato(id) {
  const resultado = await db.query(
    `SELECT c.id, c.nome, c.edicao, c.modalidade_id, m.nome AS modalidade_nome,
            c.data_inicio, c.data_fim, c.status, c.descricao,
            campeao.id AS campeao_equipe_id, campeao.nome AS campeao_equipe_nome
     ${FROM_CAMPEONATO}
     WHERE c.id = $1 AND c.demonstrativo = FALSE`,
    [id]
  );
  if (!resultado.rows.length) return null;
  const equipes = await db.query(
    `SELECT e.id, e.nome, e.sigla, e.tipo
     FROM campeonato_equipes ce
     JOIN equipes e ON e.id = ce.equipe_id
     WHERE ce.campeonato_id = $1
     ORDER BY e.nome`,
    [id]
  );
  return { ...resultado.rows[0], equipes: equipes.rows };
}

router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.id, c.nome, c.edicao, c.modalidade_id, m.nome AS modalidade_nome,
            c.data_inicio, c.data_fim, c.status, c.descricao,
            campeao.id AS campeao_equipe_id, campeao.nome AS campeao_equipe_nome,
            COUNT(ce.equipe_id)::int AS total_equipes
     ${FROM_CAMPEONATO}
     LEFT JOIN campeonato_equipes ce ON ce.campeonato_id = c.id
     WHERE c.demonstrativo = FALSE
     GROUP BY c.id, m.nome, campeao.id
     ORDER BY c.data_inicio DESC NULLS LAST, c.nome`
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const campeonato = await buscarCampeonato(id);
  if (!campeonato) return res.status(404).json({ erro: 'Campeonato não encontrado.' });
  res.json(campeonato);
});

router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarCampeonato(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const { rows } = await db.query(
    `INSERT INTO campeonatos
       (nome, edicao, modalidade_id, data_inicio, data_fim, status, descricao)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [dados.nome, dados.edicao, dados.modalidade_id, dados.data_inicio, dados.data_fim, dados.status, dados.descricao]
  );
  res.status(201).json(await buscarCampeonato(rows[0].id));
});

router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const { erros, dados } = validarCampeonato(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const resultado = await db.query(
    `UPDATE campeonatos
     SET nome = $1, edicao = $2, modalidade_id = $3, data_inicio = $4,
         data_fim = $5, status = $6, descricao = $7
     WHERE id = $8 RETURNING id`,
    [dados.nome, dados.edicao, dados.modalidade_id, dados.data_inicio, dados.data_fim, dados.status, dados.descricao, id]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Campeonato não encontrado.' });
  res.json(await buscarCampeonato(id));
});

router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const resultado = await db.query('DELETE FROM campeonatos WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Campeonato não encontrado.' });
  res.json({ mensagem: 'Campeonato excluído.' });
});

// Inscrição: a equipe precisa existir e ter a mesma modalidade do campeonato.
router.post('/:id/equipes', autenticar, exigirAdmin, async (req, res) => {
  const campeonatoId = parseId(req.params.id);
  const equipeId = parseId(req.body?.equipe_id);
  if (campeonatoId === null || equipeId === null) {
    return res.status(400).json({ erro: 'Informe IDs válidos para campeonato e equipe.' });
  }
  const compatibilidade = await db.query(
    `SELECT c.modalidade_id AS modalidade_campeonato,
            e.modalidade_id AS modalidade_equipe, me.nome AS modalidade_equipe_nome
     FROM campeonatos c
     CROSS JOIN equipes e
     JOIN modalidades me ON me.id = e.modalidade_id
     WHERE c.id = $1 AND e.id = $2`,
    [campeonatoId, equipeId]
  );
  if (!compatibilidade.rowCount) return res.status(404).json({ erro: 'Campeonato ou equipe não encontrado.' });
  if (
    compatibilidade.rows[0].modalidade_campeonato !== compatibilidade.rows[0].modalidade_equipe &&
    compatibilidade.rows[0].modalidade_equipe_nome !== 'Multimodal'
  ) {
    return res.status(400).json({ erro: 'A equipe e o campeonato precisam pertencer à mesma modalidade ou a equipe deve ser multimodal.' });
  }
  await db.query(
    'INSERT INTO campeonato_equipes (campeonato_id, equipe_id) VALUES ($1, $2)',
    [campeonatoId, equipeId]
  );
  res.status(201).json(await buscarCampeonato(campeonatoId));
});

router.delete('/:id/equipes/:equipeId', autenticar, exigirAdmin, async (req, res) => {
  const campeonatoId = parseId(req.params.id);
  const equipeId = parseId(req.params.equipeId);
  if (campeonatoId === null || equipeId === null) return res.status(400).json({ erro: 'IDs inválidos.' });
  const resultado = await db.query(
    'DELETE FROM campeonato_equipes WHERE campeonato_id = $1 AND equipe_id = $2',
    [campeonatoId, equipeId]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Inscrição não encontrada.' });
  res.json({ mensagem: 'Equipe removida do campeonato.' });
});

module.exports = router;
