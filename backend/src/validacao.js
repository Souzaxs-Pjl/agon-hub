// =====================================================================
// validacao.js - validações de entrada compartilhadas pelas rotas.
// O backend valida todos os dados, mesmo quando o frontend também valida.
// =====================================================================
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE_BYTES_SENHA = 72;
const TIPOS_MODALIDADE = ['esporte', 'esport'];
const TIPOS_EQUIPE = ['real', 'ficticia'];
const STATUS_CAMPEONATO = ['planejado', 'em_andamento', 'encerrado'];
const STATUS_PARTIDA = ['agendada', 'em_andamento', 'finalizada'];
const REGEX_SIGLA = /^[A-Z0-9$]{2,10}$/;
const REGEX_URL_IMAGEM = /^(https?:\/\/\S+|\/uploads\/[A-Za-z0-9._-]+)$/;

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  if (Buffer.byteLength(senha, 'utf8') > LIMITE_BYTES_SENHA) {
    return 'A senha é longa demais (máximo de 72 caracteres).';
  }
  return null;
}

function validarCadastro(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const nome = typeof d.nome === 'string' ? d.nome.trim() : '';
  if (nome.length < 2 || nome.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }
  const email = normalizarEmail(d.email);
  if (!REGEX_EMAIL.test(email) || email.length > 150) {
    erros.push('Informe um e-mail válido (máximo de 150 caracteres).');
  }
  const erroSenha = validarSenha(d.senha);
  if (erroSenha) erros.push(erroSenha);
  return { erros, nome, email };
}

function parseId(valor) {
  const texto = String(valor ?? '');
  if (!/^\d+$/.test(texto)) return null;
  const numero = Number(texto);
  return numero > 0 && numero <= 2147483647 ? numero : null;
}

function lerTextoOpcional(valor, limite, rotulo, erros) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') {
    erros.push(`${rotulo} deve ser um texto.`);
    return null;
  }
  const texto = valor.trim();
  if (!texto) return null;
  if (texto.length > limite) {
    erros.push(`${rotulo} deve ter no máximo ${limite} caracteres.`);
    return null;
  }
  return texto;
}

function lerTextoObrigatorio(valor, minimo, maximo, rotulo, erros) {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  if (texto.length < minimo || texto.length > maximo) {
    erros.push(`${rotulo} deve ter entre ${minimo} e ${maximo} caracteres.`);
  }
  return texto;
}

function lerDataOpcional(valor, rotulo, erros) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    erros.push(`${rotulo} deve estar no formato AAAA-MM-DD.`);
    return null;
  }
  const data = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    erros.push(`${rotulo} não é uma data válida.`);
    return null;
  }
  return valor;
}

function validarUrlImagem(valor, rotulo, erros) {
  const url = lerTextoOpcional(valor, 255, rotulo, erros);
  if (url && !REGEX_URL_IMAGEM.test(url)) {
    erros.push(`${rotulo} deve ser uma URL http(s) ou um caminho local /uploads/.`);
  }
  return url;
}

function validarModalidade(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const nome = lerTextoObrigatorio(d.nome, 2, 80, 'O nome da modalidade', erros);
  if (!TIPOS_MODALIDADE.includes(d.tipo)) {
    erros.push("O tipo deve ser 'esporte' ou 'esport'.");
  }
  const descricao = lerTextoOpcional(d.descricao, 500, 'A descrição', erros);
  return { erros, dados: { nome, tipo: d.tipo, descricao } };
}

function validarUrlInstagram(valor, rotulo, erros) {
  const url = lerTextoOpcional(valor, 255, rotulo, erros);
  if (url && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/i.test(url)) {
    erros.push(`${rotulo} deve ser um link HTTPS de perfil do Instagram.`);
  }
  return url;
}

function validarEquipe(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const nome = lerTextoObrigatorio(d.nome, 2, 100, 'O nome da equipe', erros);
  const sigla = typeof d.sigla === 'string' ? d.sigla.trim().toUpperCase() : '';
  if (!REGEX_SIGLA.test(sigla)) {
    erros.push('A sigla deve ter de 2 a 10 letras ou números, sem espaços.');
  }
  if (!TIPOS_EQUIPE.includes(d.tipo)) {
    erros.push("O tipo deve ser 'real' ou 'ficticia'.");
  }
  const modalidadeId = parseId(d.modalidade_id);
  if (modalidadeId === null) erros.push('Escolha uma modalidade válida.');
  const instituicao = lerTextoOpcional(d.instituicao, 150, 'A instituição', erros);
  const descricao = lerTextoOpcional(d.descricao, 1000, 'A descrição', erros);
  const logoUrl = validarUrlImagem(d.logo_url, 'A imagem da equipe', erros);
  const slogan = lerTextoOpcional(d.slogan, 180, 'O slogan', erros);
  const instagram_url = validarUrlInstagram(d.instagram_url, 'O Instagram da equipe', erros);
  const titulos = lerTextoOpcional(d.titulos, 5000, 'Os títulos da equipe', erros);
  const cidade = lerTextoOpcional(d.cidade, 100, 'A cidade', erros);
  const responsavel = lerTextoOpcional(d.responsavel, 150, 'O responsável', erros);
  const cores = lerTextoOpcional(d.cores, 180, 'As cores', erros);
  return {
    erros,
    dados: {
      nome, sigla, tipo: d.tipo, modalidade_id: modalidadeId,
      instituicao, descricao, logo_url: logoUrl, slogan, instagram_url,
      titulos, cidade, responsavel, cores,
    },
  };
}

function validarAtleta(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const nome = lerTextoObrigatorio(d.nome, 2, 100, 'O nome do atleta', erros);
  const apelido = lerTextoOpcional(d.apelido, 50, 'O apelido', erros);
  const bio = lerTextoOpcional(d.bio, 5000, 'A biografia', erros);
  const foto_url = validarUrlImagem(d.foto_url, 'A foto do atleta', erros);
  const instagram_url = validarUrlInstagram(d.instagram_url, 'O Instagram do atleta', erros);
  const titulos = lerTextoOpcional(d.titulos, 5000, 'Os títulos do atleta', erros);
  const geracao = lerTextoOpcional(d.geracao, 30, 'A geração do atleta', erros);
  const divisao = lerTextoOpcional(d.divisao, 30, 'A divisão do atleta', erros);
  const perfil_publico = d.perfil_publico !== false;
  if (d.perfil_publico !== undefined && typeof d.perfil_publico !== 'boolean') {
    erros.push('A autorização de perfil público deve ser verdadeira ou falsa.');
  }
  let usuario_id = null;
  if (d.usuario_id !== undefined && d.usuario_id !== null && d.usuario_id !== '') {
    usuario_id = parseId(d.usuario_id);
    if (usuario_id === null) erros.push('O usuário associado deve ser um ID válido.');
  }
  return { erros, dados: { nome, apelido, bio, foto_url, usuario_id, instagram_url, titulos, geracao, divisao, perfil_publico } };
}

function validarCampeonato(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const nome = lerTextoObrigatorio(d.nome, 2, 120, 'O nome do campeonato', erros);
  const edicao = Number(d.edicao);
  if (!Number.isInteger(edicao) || edicao < 1900 || edicao > 2200) {
    erros.push('A edição deve ser um ano válido entre 1900 e 2200.');
  }
  const modalidade_id = parseId(d.modalidade_id);
  if (modalidade_id === null) erros.push('Escolha uma modalidade válida.');
  const data_inicio = lerDataOpcional(d.data_inicio, 'A data de início', erros);
  const data_fim = lerDataOpcional(d.data_fim, 'A data de término', erros);
  if (data_inicio && data_fim && data_fim < data_inicio) {
    erros.push('A data de término não pode ser anterior à data de início.');
  }
  const status = d.status || 'planejado';
  if (!STATUS_CAMPEONATO.includes(status)) {
    erros.push("O status deve ser 'planejado', 'em_andamento' ou 'encerrado'.");
  }
  const descricao = lerTextoOpcional(d.descricao, 5000, 'A descrição', erros);
  return {
    erros,
    dados: { nome, edicao, modalidade_id, data_inicio, data_fim, status, descricao },
  };
}

function validarPartida(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const campeonato_id = parseId(d.campeonato_id);
  const equipe_casa_id = parseId(d.equipe_casa_id);
  const equipe_visitante_id = parseId(d.equipe_visitante_id);
  if (campeonato_id === null) erros.push('Escolha um campeonato válido.');
  if (equipe_casa_id === null) erros.push('Escolha a equipe mandante.');
  if (equipe_visitante_id === null) erros.push('Escolha a equipe visitante.');
  if (equipe_casa_id !== null && equipe_casa_id === equipe_visitante_id) {
    erros.push('A equipe mandante e a visitante devem ser diferentes.');
  }

  let data_hora = null;
  if (d.data_hora !== undefined && d.data_hora !== null && d.data_hora !== '') {
    if (typeof d.data_hora !== 'string' || Number.isNaN(new Date(d.data_hora).getTime())) {
      erros.push('Informe uma data e hora válidas.');
    } else {
      data_hora = d.data_hora;
    }
  }

  const fase = lerTextoOpcional(d.fase, 50, 'A fase', erros);
  const lerPlacar = (valor, rotulo) => {
    if (valor === undefined || valor === null || valor === '') return null;
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 0 || numero > 999) {
      erros.push(`${rotulo} deve ser um inteiro entre 0 e 999.`);
      return null;
    }
    return numero;
  };
  const placar_casa = lerPlacar(d.placar_casa, 'O placar mandante');
  const placar_visitante = lerPlacar(d.placar_visitante, 'O placar visitante');
  if ((placar_casa === null) !== (placar_visitante === null)) {
    erros.push('Informe os dois placares ou deixe ambos vazios.');
  }
  const status = d.status || 'agendada';
  if (!STATUS_PARTIDA.includes(status)) {
    erros.push("O status deve ser 'agendada', 'em_andamento' ou 'finalizada'.");
  }
  if (status === 'finalizada' && (placar_casa === null || placar_visitante === null)) {
    erros.push('Uma partida finalizada precisa ter os dois placares.');
  }
  const demonstrativo = d.demonstrativo === undefined ? false : d.demonstrativo;
  if (typeof demonstrativo !== 'boolean') erros.push('O campo demonstrativo deve ser verdadeiro ou falso.');

  return {
    erros,
    dados: {
      campeonato_id, equipe_casa_id, equipe_visitante_id, data_hora, fase,
      placar_casa, placar_visitante, status, demonstrativo,
    },
  };
}

function validarNoticia(corpo) {
  const d = corpo && typeof corpo === 'object' ? corpo : {};
  const erros = [];
  const titulo = lerTextoObrigatorio(d.titulo, 3, 200, 'O título', erros);
  const resumo = lerTextoOpcional(d.resumo, 300, 'O resumo', erros);
  const conteudo = lerTextoObrigatorio(d.conteudo, 1, 20000, 'O conteúdo', erros);
  const imagem_url = validarUrlImagem(d.imagem_url, 'A imagem da notícia', erros);
  return { erros, dados: { titulo, resumo, conteudo, imagem_url } };
}

function validarFuncaoEquipe(valor) {
  const erros = [];
  const funcao = lerTextoOpcional(valor, 50, 'A função', erros);
  return { erros, funcao };
}

module.exports = {
  REGEX_EMAIL, normalizarEmail, validarSenha, validarCadastro, parseId,
  validarModalidade, validarEquipe, validarAtleta, validarCampeonato,
  validarPartida, validarNoticia, validarFuncaoEquipe,
};
