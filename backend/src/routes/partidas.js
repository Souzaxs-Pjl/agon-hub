// =====================================================================
// routes/partidas.js - CRUD de partidas e placares.
// Uma partida só pode usar equipes inscritas no campeonato e da mesma
// modalidade da competição.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarPartida } = require('../validacao');

const router = express.Router();

const SELECT_PARTIDA = `
  SELECT p.id, p.campeonato_id, c.nome AS campeonato_nome, c.edicao,
         p.equipe_casa_id, ec.nome AS equipe_casa_nome,
         p.equipe_visitante_id, ev.nome AS equipe_visitante_nome,
         p.data_hora, p.fase, p.placar_casa, p.placar_visitante,
         p.status, p.demonstrativo
  FROM partidas p
  JOIN campeonatos c ON c.id = p.campeonato_id
  JOIN equipes ec ON ec.id = p.equipe_casa_id
  JOIN equipes ev ON ev.id = p.equipe_visitante_id
`;

async function buscarPartida(id) {
  const { rows } = await db.query(`${SELECT_PARTIDA} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

async function validarParticipantes(dados) {
  const resultado = await db.query(
    `SELECT c.modalidade_id AS modalidade_campeonato,
            ec.modalidade_id AS modalidade_casa,
            ev.modalidade_id AS modalidade_visitante,
            EXISTS (
              SELECT 1 FROM campeonato_equipes ce
              WHERE ce.campeonato_id = c.id AND ce.equipe_id = ec.id
            ) AS casa_inscrita,
            EXISTS (
              SELECT 1 FROM campeonato_equipes ce
              WHERE ce.campeonato_id = c.id AND ce.equipe_id = ev.id
            ) AS visitante_inscrita
     FROM campeonatos c
     JOIN equipes ec ON ec.id = $2
     JOIN equipes ev ON ev.id = $3
     WHERE c.id = $1`,
    [dados.campeonato_id, dados.equipe_casa_id, dados.equipe_visitante_id]
  );
  if (!resultado.rowCount) return 'Campeonato ou equipe não encontrado.';
  const r = resultado.rows[0];
  if (
    r.modalidade_campeonato !== r.modalidade_casa ||
    r.modalidade_campeonato !== r.modalidade_visitante
  ) {
    return 'As duas equipes precisam pertencer à modalidade do campeonato.';
  }
  if (!r.casa_inscrita || !r.visitante_inscrita) {
    return 'As duas equipes precisam estar inscritas no campeonato antes da partida.';
  }
  return null;
}

router.get('/', async (req, res) => {
  const campeonatoId = req.query.campeonato_id ? parseId(req.query.campeonato_id) : null;
  if (req.query.campeonato_id && campeonatoId === null) {
    return res.status(400).json({ erro: 'ID de campeonato inválido.' });
  }
  const { rows } = campeonatoId
    ? await db.query(`${SELECT_PARTIDA} WHERE p.campeonato_id = $1 ORDER BY p.data_hora NULLS LAST, p.id`, [campeonatoId])
    : await db.query(`${SELECT_PARTIDA} ORDER BY p.data_hora NULLS LAST, p.id`);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const partida = await buscarPartida(id);
  if (!partida) return res.status(404).json({ erro: 'Partida não encontrada.' });
  res.json(partida);
});

router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarPartida(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const erroParticipantes = await validarParticipantes(dados);
  if (erroParticipantes) return res.status(400).json({ erro: erroParticipantes });
  const { rows } = await db.query(
    `INSERT INTO partidas
       (campeonato_id, equipe_casa_id, equipe_visitante_id, data_hora, fase,
        placar_casa, placar_visitante, status, demonstrativo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [dados.campeonato_id, dados.equipe_casa_id, dados.equipe_visitante_id,
      dados.data_hora, dados.fase, dados.placar_casa, dados.placar_visitante,
      dados.status, dados.demonstrativo]
  );
  res.status(201).json(await buscarPartida(rows[0].id));
});

router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const { erros, dados } = validarPartida(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const erroParticipantes = await validarParticipantes(dados);
  if (erroParticipantes) return res.status(400).json({ erro: erroParticipantes });
  const resultado = await db.query(
    `UPDATE partidas
     SET campeonato_id = $1, equipe_casa_id = $2, equipe_visitante_id = $3,
         data_hora = $4, fase = $5, placar_casa = $6, placar_visitante = $7,
         status = $8, demonstrativo = $9
     WHERE id = $10 RETURNING id`,
    [dados.campeonato_id, dados.equipe_casa_id, dados.equipe_visitante_id,
      dados.data_hora, dados.fase, dados.placar_casa, dados.placar_visitante,
      dados.status, dados.demonstrativo, id]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Partida não encontrada.' });
  res.json(await buscarPartida(id));
});

router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const resultado = await db.query('DELETE FROM partidas WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Partida não encontrada.' });
  res.json({ mensagem: 'Partida excluída.' });
});

module.exports = router;
