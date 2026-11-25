// =====================================================================
// routes/noticias.js - consulta pública e CRUD administrativo de notícias.
// =====================================================================
const express = require('express');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId, validarNoticia } = require('../validacao');

const router = express.Router();

const SELECT_NOTICIA = `
  SELECT n.id, n.titulo, n.resumo, n.conteudo, n.imagem_url,
         n.autor_id, u.nome AS autor_nome, n.publicado_em
  FROM noticias n
  LEFT JOIN usuarios u ON u.id = n.autor_id
`;

async function buscarNoticia(id) {
  const { rows } = await db.query(
    `${SELECT_NOTICIA} WHERE n.id = $1 AND n.demonstrativo = FALSE`,
    [id]
  );
  return rows[0] || null;
}

router.get('/', async (req, res) => {
  const { rows } = await db.query(
    `${SELECT_NOTICIA} WHERE n.demonstrativo = FALSE ORDER BY n.publicado_em DESC, n.id DESC`
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const noticia = await buscarNoticia(id);
  if (!noticia) return res.status(404).json({ erro: 'Notícia não encontrada.' });
  res.json(noticia);
});

router.post('/', autenticar, exigirAdmin, async (req, res) => {
  const { erros, dados } = validarNoticia(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const { rows } = await db.query(
    `INSERT INTO noticias (titulo, resumo, conteudo, imagem_url, autor_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [dados.titulo, dados.resumo, dados.conteudo, dados.imagem_url, req.usuario.id]
  );
  res.status(201).json(await buscarNoticia(rows[0].id));
});

router.put('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const { erros, dados } = validarNoticia(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  const resultado = await db.query(
    `UPDATE noticias
     SET titulo = $1, resumo = $2, conteudo = $3, imagem_url = $4
     WHERE id = $5 RETURNING id`,
    [dados.titulo, dados.resumo, dados.conteudo, dados.imagem_url, id]
  );
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Notícia não encontrada.' });
  res.json(await buscarNoticia(id));
});

router.delete('/:id', autenticar, exigirAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  const resultado = await db.query('DELETE FROM noticias WHERE id = $1', [id]);
  if (!resultado.rowCount) return res.status(404).json({ erro: 'Notícia não encontrada.' });
  res.json({ mensagem: 'Notícia excluída.' });
});

module.exports = router;
