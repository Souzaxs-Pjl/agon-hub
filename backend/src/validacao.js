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

// ---------------------------------------------------------------------
// Validação de modalidades e equipes
// ---------------------------------------------------------------------
const TIPOS_MODALIDADE = ['esporte', 'esport'];
const TIPOS_EQUIPE = ['real', 'ficticia'];
const REGEX_SIGLA = /^[A-Z0-9]{2,10}$/; // depois de deixar em maiúsculas
const REGEX_URL = /^https?:\/\/\S+$/;

// Converte um id vindo da URL (ex.: "12") em inteiro positivo.
// Devolve null se não for um id válido ("abc", "-1", "1.5", "0").
function parseId(valor) {
  const texto = String(valor ?? '');
  if (!/^\d+$/.test(texto)) return null;
  const numero = Number(texto);
  return numero > 0 && numero <= 2147483647 ? numero : null;
}

// Lê um campo de texto opcional. Vazio vira null. Se for inválido,
// acrescenta a mensagem em "erros" e devolve null.
function lerTextoOpcional(valor, limite, rotulo, erros) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') {
    erros.push(`${rotulo} deve ser um texto.`);
    return null;
  }
  const texto = valor.trim();
  if (texto.length === 0) return null;
  if (texto.length > limite) {
    erros.push(`${rotulo} deve ter no máximo ${limite} caracteres.`);
    return null;
  }
  return texto;
}

// Valida uma modalidade. Retorna { erros, dados }.
function validarModalidade(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];

  const nome = typeof d.nome === 'string' ? d.nome.trim() : '';
  if (nome.length < 2 || nome.length > 80) {
    erros.push('O nome da modalidade deve ter entre 2 e 80 caracteres.');
  }
  if (!TIPOS_MODALIDADE.includes(d.tipo)) {
    erros.push("O tipo deve ser 'esporte' ou 'esport'.");
  }
  const descricao = lerTextoOpcional(d.descricao, 500, 'A descrição', erros);

  return { erros, dados: { nome, tipo: d.tipo, descricao } };
}

// Valida uma equipe. Retorna { erros, dados }.
// A sigla é convertida para maiúsculas antes de conferir o formato.
function validarEquipe(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];

  const nome = typeof d.nome === 'string' ? d.nome.trim() : '';
  if (nome.length < 2 || nome.length > 100) {
    erros.push('O nome da equipe deve ter entre 2 e 100 caracteres.');
  }

  const sigla = typeof d.sigla === 'string' ? d.sigla.trim().toUpperCase() : '';
  if (!REGEX_SIGLA.test(sigla)) {
    erros.push('A sigla deve ter de 2 a 10 letras ou números, sem espaços.');
  }

  if (!TIPOS_EQUIPE.includes(d.tipo)) {
    erros.push("O tipo deve ser 'real' ou 'ficticia'.");
  }

  const modalidadeId = parseId(d.modalidade_id);
  if (modalidadeId === null) {
    erros.push('Escolha uma modalidade válida.');
  }

  const instituicao = lerTextoOpcional(d.instituicao, 150, 'A instituição', erros);
  const descricao = lerTextoOpcional(d.descricao, 1000, 'A descrição', erros);
  const logoUrl = lerTextoOpcional(d.logo_url, 255, 'A URL do logo', erros);
  if (logoUrl && !REGEX_URL.test(logoUrl)) {
    erros.push('A URL do logo deve começar com http:// ou https://.');
  }

  return {
    erros,
    dados: {
      nome,
      sigla,
      tipo: d.tipo,
      modalidade_id: modalidadeId,
      instituicao,
      descricao,
      logo_url: logoUrl,
    },
  };
}

module.exports = {
  REGEX_EMAIL,
  normalizarEmail,
  validarSenha,
  validarCadastro,
  parseId,
  validarModalidade,
  validarEquipe,
};
