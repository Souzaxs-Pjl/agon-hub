// =====================================================================
// validacao.js - funções puras de validação (não dependem de banco nem
// de Express, por isso são fáceis de testar).
//
// Regra de ouro: NUNCA confie nos dados que chegam do cliente. O frontend
// pode validar para ajudar o usuário, mas quem garante a segurança é o
// backend.
// =====================================================================

// Formato básico de e-mail: algo@algo.algo (sem espaços).
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// O bcrypt só considera os 72 primeiros bytes da senha; o resto é ignorado.
const LIMITE_BYTES_SENHA = 72;

// Normaliza o e-mail: tira espaços e deixa tudo minúsculo.
// Assim "Maria@Email.com" e "maria@email.com" são o MESMO e-mail
// (a restrição UNIQUE do banco diferencia maiúsculas de minúsculas).
function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// Retorna uma mensagem de erro (texto) ou null se a senha for válida.
function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  if (Buffer.byteLength(senha, 'utf8') > LIMITE_BYTES_SENHA) {
    return 'A senha é longa demais (máximo de 72 caracteres).';
  }
  return null;
}

// Valida os dados do cadastro. Retorna:
//   { erros: [...mensagens], nome, email }
// onde nome e email já vêm limpos (trim e minúsculas no e-mail).
function validarCadastro(corpo) {
  const dados = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];

  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  if (nome.length < 2 || nome.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  const email = normalizarEmail(dados.email);
  if (!REGEX_EMAIL.test(email) || email.length > 150) {
    erros.push('Informe um e-mail válido (máximo de 150 caracteres).');
  }

  const erroSenha = validarSenha(dados.senha);
  if (erroSenha) erros.push(erroSenha);

  return { erros, nome, email };
}

module.exports = { REGEX_EMAIL, normalizarEmail, validarSenha, validarCadastro };
