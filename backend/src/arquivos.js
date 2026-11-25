// =====================================================================
// arquivos.js - limpeza segura de imagens locais depois de alterações.
// Só remove arquivos gerados pelo próprio sistema e que não tenham
// outra referência no banco de dados.
// =====================================================================
const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('./db');

const PASTA_UPLOADS = path.join(__dirname, '..', 'uploads');
const REGEX_UPLOAD_AGON = /^\/uploads\/((?:equipe|atleta)-[0-9a-f-]+\.(?:jpg|png|webp))$/i;

async function limparImagemSeNaoUtilizada(url) {
  if (typeof url !== 'string') return false;
  const correspondencia = REGEX_UPLOAD_AGON.exec(url);
  if (!correspondencia) return false;

  try {
    const { rows } = await db.query(
      `SELECT
         EXISTS (SELECT 1 FROM equipes WHERE logo_url = $1)
         OR EXISTS (SELECT 1 FROM atletas WHERE foto_url = $1)
         AS em_uso`,
      [url]
    );
    if (rows[0]?.em_uso) return false;

    const caminho = path.join(PASTA_UPLOADS, correspondencia[1]);
    await fs.unlink(caminho);
    return true;
  } catch (erro) {
    if (erro.code !== 'ENOENT') {
      console.error('Não foi possível limpar uma imagem antiga:', erro.message);
    }
    return false;
  }
}

module.exports = { limparImagemSeNaoUtilizada };
