// Comunidade AGON Hub: feed, publicações, curtidas e comentários.
const express = require('express');
const db = require('../db');
const { autenticar } = require('../middlewares/auth');
const router = express.Router();


// Opções de autoria disponíveis para a conta autenticada.
router.get('/opcoes-autoria', autenticar, async (req, res) => {
  const atletaResult = await db.query(
    'SELECT id, nome, apelido FROM atletas WHERE usuario_id=$1 AND demonstrativo=FALSE AND perfil_publico=TRUE LIMIT 1',
    [req.usuario.id]
  );
  const equipesResult = await db.query(
    `SELECT DISTINCT e.id, e.nome, e.sigla
     FROM equipe_atletas ea
     JOIN atletas a ON a.id=ea.atleta_id
     JOIN equipes e ON e.id=ea.equipe_id
     WHERE a.usuario_id=$1 AND a.demonstrativo=FALSE AND a.perfil_publico=TRUE AND e.demonstrativo=FALSE
     ORDER BY e.nome`,
    [req.usuario.id]
  );
  res.json({ atleta: atletaResult.rows[0] || null, equipes: equipesResult.rows });
});

router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.id, p.tipo_autor, p.atleta_id, p.equipe_id, p.texto, p.criado_em,
      u.id AS usuario_id, u.nome AS usuario_nome, u.foto_url AS usuario_foto,
      a.nome AS atleta_nome, a.apelido AS atleta_apelido, a.foto_url AS atleta_foto,
      e.nome AS equipe_nome, e.sigla AS equipe_sigla, e.logo_url AS equipe_logo,
      (SELECT COUNT(*)::int FROM publicacao_curtidas pc WHERE pc.publicacao_id=p.id) AS curtidas,
      (SELECT COUNT(*)::int FROM publicacao_comentarios cm WHERE cm.publicacao_id=p.id) AS comentarios
     FROM publicacoes p
     JOIN usuarios u ON u.id=p.autor_usuario_id
     LEFT JOIN atletas a ON a.id=p.atleta_id
     LEFT JOIN equipes e ON e.id=p.equipe_id
     WHERE (a.id IS NULL OR (a.demonstrativo = FALSE AND a.perfil_publico = TRUE))
       AND (e.id IS NULL OR e.demonstrativo = FALSE)
     ORDER BY p.criado_em DESC LIMIT 50`
  );
  res.json(rows);
});

router.post('/', autenticar, async (req, res) => {
  const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';
  const tipo = req.body?.tipo_autor || 'usuario';
  const atletaId = Number(req.body?.atleta_id);
  const equipeId = Number(req.body?.equipe_id);
  if (!texto || texto.length > 2000) return res.status(400).json({ erro: 'A publicação deve ter de 1 a 2000 caracteres.' });
  if (!['usuario','atleta','equipe'].includes(tipo)) return res.status(400).json({ erro: 'Tipo de autor inválido.' });
  let atleta = null, equipe = null;
  if (tipo === 'atleta') {
    if (!Number.isInteger(atletaId) || atletaId < 1) return res.status(400).json({ erro: 'Atleta inválido.' });
    const r = await db.query('SELECT id FROM atletas WHERE id=$1 AND usuario_id=$2 AND demonstrativo=FALSE AND perfil_publico=TRUE', [atletaId, req.usuario.id]);
    if (!r.rows.length) return res.status(403).json({ erro: 'Só é possível publicar como seu próprio perfil de atleta.' });
    atleta = atletaId;
  }
  if (tipo === 'equipe') {
    if (!Number.isInteger(equipeId) || equipeId < 1) return res.status(400).json({ erro: 'Equipe inválida.' });
    const r = await db.query(
      `SELECT 1 FROM equipe_atletas ea JOIN atletas a ON a.id=ea.atleta_id
       WHERE ea.equipe_id=$1 AND a.usuario_id=$2 AND a.perfil_publico=TRUE AND a.demonstrativo=FALSE LIMIT 1`, [equipeId, req.usuario.id]
    );
    if (!r.rows.length) return res.status(403).json({ erro: 'É necessário ser atleta vinculado à equipe para publicar em nome dela.' });
    equipe = equipeId;
  }
  const { rows } = await db.query(
    `INSERT INTO publicacoes (autor_usuario_id,tipo_autor,atleta_id,equipe_id,texto)
     VALUES ($1,$2,$3,$4,$5) RETURNING id,tipo_autor,atleta_id,equipe_id,texto,criado_em`,
    [req.usuario.id,tipo,atleta,equipe,texto]
  );
  const publicacao = await db.query(
    `SELECT p.id, p.tipo_autor, p.atleta_id, p.equipe_id, p.texto, p.criado_em,
      u.id AS usuario_id, u.nome AS usuario_nome, u.foto_url AS usuario_foto,
      a.nome AS atleta_nome, a.apelido AS atleta_apelido, a.foto_url AS atleta_foto,
      e.nome AS equipe_nome, e.sigla AS equipe_sigla, e.logo_url AS equipe_logo,
      (SELECT COUNT(*)::int FROM publicacao_curtidas pc WHERE pc.publicacao_id=p.id) AS curtidas,
      (SELECT COUNT(*)::int FROM publicacao_comentarios cm WHERE cm.publicacao_id=p.id) AS comentarios
     FROM publicacoes p
     JOIN usuarios u ON u.id=p.autor_usuario_id
     LEFT JOIN atletas a ON a.id=p.atleta_id
     LEFT JOIN equipes e ON e.id=p.equipe_id
     WHERE p.id=$1`,
    [rows[0].id]
  );
  res.status(201).json(publicacao.rows[0]);
});

router.delete('/:id', autenticar, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido.' });
  const result = await db.query('DELETE FROM publicacoes WHERE id=$1 AND (autor_usuario_id=$2 OR $3=\'admin\')', [id,req.usuario.id,req.usuario.papel]);
  if (!result.rowCount) return res.status(404).json({ erro: 'Publicação não encontrada ou sem permissão.' });
  res.status(204).end();
});

router.put('/:id/curtida', autenticar, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido.' });
  const exists = await db.query('SELECT 1 FROM publicacoes WHERE id=$1', [id]);
  if (!exists.rows.length) return res.status(404).json({ erro: 'Publicação não encontrada.' });
  const current = await db.query('SELECT 1 FROM publicacao_curtidas WHERE publicacao_id=$1 AND usuario_id=$2', [id,req.usuario.id]);
  if (current.rows.length) {
    await db.query('DELETE FROM publicacao_curtidas WHERE publicacao_id=$1 AND usuario_id=$2', [id,req.usuario.id]);
    return res.json({ curtida: false });
  }
  await db.query('INSERT INTO publicacao_curtidas(publicacao_id,usuario_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [id,req.usuario.id]);
  res.json({ curtida: true });
});

router.get('/:id/comentarios', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido.' });
  const { rows } = await db.query(
    `SELECT c.id,c.publicacao_id,c.texto,c.criado_em,u.id AS usuario_id,u.nome AS usuario_nome,u.foto_url AS usuario_foto
     FROM publicacao_comentarios c JOIN usuarios u ON u.id=c.usuario_id
     WHERE c.publicacao_id=$1 ORDER BY c.criado_em ASC LIMIT 100`, [id]
  );
  res.json(rows);
});

router.post('/:id/comentarios', autenticar, async (req, res) => {
  const id = Number(req.params.id);
  const texto = typeof req.body?.texto === 'string' ? req.body.texto.trim() : '';
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido.' });
  if (!texto || texto.length > 1000) return res.status(400).json({ erro: 'O comentário deve ter de 1 a 1000 caracteres.' });
  const exists = await db.query('SELECT 1 FROM publicacoes WHERE id=$1', [id]);
  if (!exists.rows.length) return res.status(404).json({ erro: 'Publicação não encontrada.' });
  const { rows } = await db.query(
    'INSERT INTO publicacao_comentarios(publicacao_id,usuario_id,texto) VALUES($1,$2,$3) RETURNING id,publicacao_id,texto,criado_em',
    [id,req.usuario.id,texto]
  );
  res.status(201).json({ ...rows[0], usuario_id:req.usuario.id, usuario_nome:req.usuario.nome, usuario_foto:req.usuario.foto_url });
});

router.delete('/:id/comentarios/:comentarioId', autenticar, async (req, res) => {
  const publicacaoId = Number(req.params.id);
  const comentarioId = Number(req.params.comentarioId);
  if (!Number.isInteger(publicacaoId) || publicacaoId < 1 || !Number.isInteger(comentarioId) || comentarioId < 1) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  const result = await db.query(
    'DELETE FROM publicacao_comentarios WHERE id=$1 AND publicacao_id=$2 AND usuario_id=$3',
    [comentarioId, publicacaoId, req.usuario.id]
  );
  if (!result.rowCount) return res.status(404).json({ erro: 'Comentário não encontrado ou você não tem permissão para excluí-lo.' });
  res.status(204).end();
});

module.exports = router;
