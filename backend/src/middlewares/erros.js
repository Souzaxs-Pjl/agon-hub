// =====================================================================
// erros.js - tratamento central de erros HTTP, PostgreSQL e uploads.
// =====================================================================
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição grande demais.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ erro: 'A imagem ultrapassa o limite de 5 MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ erro: 'Envie apenas um arquivo no campo imagem.' });
  }

  switch (err.code) {
    case '23505': {
      const mensagens = {
        equipes_nome_key: 'Já existe uma equipe com esse nome.',
        equipes_sigla_key: 'Já existe uma equipe com essa sigla.',
        modalidades_nome_key: 'Já existe uma modalidade com esse nome.',
        campeonatos_nome_edicao_key: 'Já existe um campeonato com esse nome e edição.',
      };
      return res.status(409).json({
        erro: mensagens[err.constraint] || 'Já existe um registro com esse valor.',
      });
    }
    case '23503':
      if (req.method === 'DELETE') {
        return res.status(409).json({
          erro: 'Não é possível excluir: este registro está em uso por outros registros.',
        });
      }
      return res.status(400).json({
        erro: 'Referência inválida: um dos registros informados não existe.',
      });
    case '23514':
      return res.status(400).json({ erro: 'Algum valor informado não é permitido.' });
    case '23502':
      return res.status(400).json({ erro: 'Há um campo obrigatório que não foi informado.' });
    case '22P02':
    case '22007':
    case '22003':
      return res.status(400).json({ erro: 'Algum valor informado está em formato inválido.' });
  }

  console.error('Erro inesperado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { rotaNaoEncontrada, tratarErros };
