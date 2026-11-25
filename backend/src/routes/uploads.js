// =====================================================================
// routes/uploads.js - upload controlado de logos e fotos.
// Aceita apenas JPEG, PNG e WebP, com limite de 5 MB e verificação
// da assinatura binária. Somente administradores podem enviar arquivos.
// =====================================================================
const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const db = require('../db');
const { autenticar, exigirAdmin } = require('../middlewares/auth');
const { parseId } = require('../validacao');

const router = express.Router();
const pastaUploads = path.join(__dirname, '..', '..', 'uploads');
const receberArquivo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

function detectarImagem(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extensao: 'jpg', mime: 'image/jpeg' };
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return { extensao: 'png', mime: 'image/png' };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { extensao: 'webp', mime: 'image/webp' };
  }
  return null;
}

async function salvarImagem(req, res, tabela, coluna, prefixo, rotulo) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ erro: 'ID inválido.' });
  if (!req.file) return res.status(400).json({ erro: 'Envie um arquivo no campo imagem.' });

  const imagem = detectarImagem(req.file.buffer);
  if (!imagem || imagem.mime !== req.file.mimetype) {
    return res.status(400).json({ erro: 'Arquivo inválido. Envie uma imagem JPEG, PNG ou WebP.' });
  }

  const existe = await db.query(`SELECT id FROM ${tabela} WHERE id = $1`, [id]);
  if (!existe.rowCount) return res.status(404).json({ erro: `${rotulo} não encontrado.` });

  await fs.mkdir(pastaUploads, { recursive: true });
  const nomeArquivo = `${prefixo}-${crypto.randomUUID()}.${imagem.extensao}`;
  const caminho = path.join(pastaUploads, nomeArquivo);
  const url = `/uploads/${nomeArquivo}`;

  try {
    await fs.writeFile(caminho, req.file.buffer, { flag: 'wx' });
    const atualizacao = await db.query(
      `UPDATE ${tabela} SET ${coluna} = $1 WHERE id = $2 RETURNING id, ${coluna}`,
      [url, id]
    );
    res.status(201).json({
      mensagem: 'Imagem enviada e vinculada com sucesso.',
      id: atualizacao.rows[0].id,
      [coluna]: atualizacao.rows[0][coluna],
    });
  } catch (erro) {
    await fs.unlink(caminho).catch(() => {});
    throw erro;
  }
}

router.post('/equipes/:id/logo', autenticar, exigirAdmin, receberArquivo.single('imagem'), (req, res) =>
  salvarImagem(req, res, 'equipes', 'logo_url', 'equipe', 'Equipe')
);

router.post('/atletas/:id/foto', autenticar, exigirAdmin, receberArquivo.single('imagem'), (req, res) =>
  salvarImagem(req, res, 'atletas', 'foto_url', 'atleta', 'Atleta')
);

module.exports = router;
