// =====================================================================
// routes/atletas.js - cadastro de atletas e seus vínculos com equipes.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarAtleta, validarFuncaoEquipe } = require('../validacao');
const { limparImagemSeNaoUtilizada } = require('../arquivos');

const router = express.Router();

async function buscarAtleta(id, incluirUsuario = false) {
  const camposPrivados = incluirUsuario ? ', a.usuario_id' : '';
  const resultado = await db.query(
    `SELECT a.id, a.nome, a.apelido, a.bio, a.foto_url${camposPrivados}
     FROM atletas a
     WHERE a.id = $1`,
    [id]
  );
  if (resultado.rows.length === 0) return null;

  const equipes = await db.query(
    `SELECT e.id, e.nome, e.sigla, ea.funcao
     FROM equipe_atletas ea
     JOIN equipes e ON e.id = ea.equipe_id
     WHERE ea.atleta_id = $1
     ORDER BY e.nome`,
    [id]
  );
  return { ...resultado.rows[0], equipes: equipes.rows };
}

router.get('/admin/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const atleta = await buscarAtleta(id, true);
  if (!atleta) return res.status(404).json({ erro: 'Atleta não encontrado.' });
  res.json(atleta);
});

router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT a.id, a.nome, a.apelido, a.bio, a.foto_url,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', e.id,
                  'nome', e.nome,
                  'sigla', e.sigla,
                  'funcao', ea.funcao
                ) ORDER BY e.nome
              ) FILTER (WHERE e.id IS NOT NULL),
              '[]'::json
            ) AS equipes
     FROM atletas a
     LEFT JOIN equipe_atletas ea ON ea.atleta_id = a.id
     LEFT JOIN equipes e ON e.id = ea.equipe_id
     GROUP BY a.id
     ORDER BY a.nome`
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const atleta = await buscarAtleta(id);
  if (!atleta) return res.status(404).json({ erro: 'Atleta não encontrado.' });
  res.json(atleta);
});

router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarAtleta(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const { rows } = await db.query(
    `INSERT INTO atletas (nome, apelido, bio, foto_url, usuario_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [dados.nome, dados.apelido, dados.bio, dados.foto_url, dados.usuario_id]
  );
  res.status(201).json(await buscarAtleta(rows[0].id, true));
});

router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });

  const anterior = await db.query('SELECT foto_url FROM atletas WHERE id = $1', [id]);
  if (!anterior.rowCount) return res.status(404).json({ erro: 'Atleta não encontrado.' });

  const { erros, dados } = validarAtleta(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const resultado = await db.query(
    `UPDATE atletas
     SET nome = $1, apelido = $2, bio = $3, foto_url = $4, usuario_id = $5
     WHERE id = $6 RETURNING id`,
    [dados.nome, dados.apelido, dados.bio, dados.foto_url, dados.usuario_id, id]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Atleta não encontrado.' });

  await limparImagemSeNaoUtilizada(anterior.rows[0].foto_url);
  res.json(await buscarAtleta(id, true));
});

router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const resultado = await db.query(
    'DELETE FROM atletas WHERE id = $1 RETURNING foto_url',
    [id]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Atleta não encontrado.' });
  await limparImagemSeNaoUtilizada(resultado.rows[0].foto_url);
  res.json({ mensagem: 'Atleta excluído.' });
});

// Cria um vínculo N:N e registra a função do atleta naquela equipe.
router.post('/:id/equipes', autenticar, exigirAdmin, async (req, res) => {
  const atletaId = parseId(req.params.id);
  const equipeId = parseId(req.body?.equipe_id);
  const { erros, funcao } = validarFuncaoEquipe(req.body?.funcao);
  if (atletaId === null || equipeId === null) {
    return res.status(400).json({ erro: 'Informe IDs válidos para atleta e equipe.' });
  }
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  await db.query(
    'INSERT INTO equipe_atletas (equipe_id, atleta_id, funcao) VALUES ($1, $2, $3)',
    [equipeId, atletaId, funcao]
  );
  res.status(201).json(await buscarAtleta(atletaId, true));
});

router.put('/:id/equipes/:equipeId', autenticar, exigirAdmin, async (req, res) => {
  const atletaId = parseId(req.params.id);
  const equipeId = parseId(req.params.equipeId);
  const { erros, funcao } = validarFuncaoEquipe(req.body?.funcao);
  if (atletaId === null || equipeId === null) return res.status(400).json({ erro: 'IDs inválidos.' });
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const resultado = await db.query(
    'UPDATE equipe_atletas SET funcao = $1 WHERE atleta_id = $2 AND equipe_id = $3',
    [funcao, atletaId, equipeId]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Vínculo não encontrado.' });
  res.json(await buscarAtleta(atletaId, true));
});

router.delete('/:id/equipes/:equipeId', autenticar, exigirAdmin, async (req, res) => {
  const atletaId = parseId(req.params.id);
  const equipeId = parseId(req.params.equipeId);
  if (atletaId === null || equipeId === null) return res.status(400).json({ erro: 'IDs inválidos.' });
  const resultado = await db.query(
    'DELETE FROM equipe_atletas WHERE atleta_id = $1 AND equipe_id = $2',
    [atletaId, equipeId]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Vínculo não encontrado.' });
  res.json({ mensagem: 'Vínculo removido.' });
});

module.exports = router;
