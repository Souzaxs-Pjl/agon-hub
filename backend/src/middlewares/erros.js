// =====================================================================
// erros.js - tratamento central de erros
//
// Em vez de cada rota tratar todos os erros, elas apenas deixam o erro
// "subir" e este arquivo decide qual resposta HTTP enviar.
// (No Express 5, um erro dentro de uma função async é repassado
// automaticamente para cá.)
//
// Regra: o cliente recebe uma mensagem amigável; o detalhe técnico do erro
// aparece só no terminal do servidor, nunca na resposta.
// =====================================================================

// Chamada quando nenhuma rota respondeu ao pedido.
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// O Express reconhece este middleware como "tratador de erros" porque ele
// tem 4 parâmetros (err, req, res, next). Não remova o "next".
// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  // JSON mal formado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição grande demais.' });
  }

  // Erros do PostgreSQL: cada um tem um código (err.code).
  switch (err.code) {
    case '23505': // unique_violation: valor repetido em campo UNIQUE
      return res.status(409).json({ erro: 'Já existe um registro com esse valor.' });

    case '23503': // foreign_key_violation
      // Ao EXCLUIR: ainda existem registros que dependem deste.
      if (req.method === 'DELETE') {
        return res.status(409).json({
          erro: 'Não é possível excluir: este registro está em uso por outros registros.',
        });
      }
      // Ao CRIAR/EDITAR: um id informado não existe (ex.: modalidade_id inválido).
      return res.status(400).json({
        erro: 'Referência inválida: um dos registros informados não existe.',
      });

    case '23514': // check_violation: valor fora das regras (ex.: papel inválido)
      return res.status(400).json({ erro: 'Algum valor informado não é permitido.' });

    case '23502': // not_null_violation
      return res.status(400).json({ erro: 'Há um campo obrigatório que não foi informado.' });

    case '22P02': // formato inválido (ex.: texto onde se esperava número)
    case '22007': // formato de data inválido
    case '22003': // número fora do intervalo
      return res.status(400).json({ erro: 'Algum valor informado está em formato inválido.' });
  }

  // Qualquer outro erro é um problema nosso: registra no terminal e
  // responde de forma genérica (sem vazar detalhes internos).
  console.error('Erro inesperado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { rotaNaoEncontrada, tratarErros };
