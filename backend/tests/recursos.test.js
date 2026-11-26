// =====================================================================
// Testes de integração dos módulos de modalidades, atletas, campeonatos,
// partidas, notícias, relacionamentos, permissões e uploads.
// =====================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}`;

async function chamar(metodo, caminho, { corpo, token, headers = {} } = {}) {
  const cabecalhos = { ...headers };
  let body;
  if (corpo instanceof FormData) {
    body = corpo;
  } else if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
    body = JSON.stringify(corpo);
  }
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  const resposta = await fetch(BASE + caminho, { method: metodo, headers: cabecalhos, body });
  let dados = null;
  try { dados = await resposta.json(); } catch { /* sem JSON */ }
  return { status: resposta.status, dados };
}

const sufixo = String(Date.now()).slice(-7);
const emailAdmin = process.env.ADMIN_EMAIL;
const senhaAdmin = process.env.ADMIN_SENHA;
let adminToken;
let usuarioToken;
let modalidadeId;
let equipeTesteIds = [];
let atletaId;
let campeonatoId;
let partidaId;
let noticiaId;
let equipeUploadId;
let fotoUploadUrl;
let atletaVinculado = false;
let equipesInscritas = false;

before(async () => {
  if (!emailAdmin || !senhaAdmin) {
    throw new Error('Configure ADMIN_EMAIL e ADMIN_SENHA e execute npm run criar-admin.');
  }
  const saude = await chamar('GET', '/api/saude');
  assert.equal(saude.status, 200, 'API e PostgreSQL precisam estar ativos');
  const login = await chamar('POST', '/api/auth/login', {
    corpo: { email: emailAdmin, senha: senhaAdmin },
  });
  assert.equal(login.status, 200);
  adminToken = login.dados.token;

  const cadastro = await chamar('POST', '/api/auth/register', {
    corpo: {
      nome: 'Usuário comum de integração',
      email: `teste.recursos.${sufixo}@agonhub.example`,
      senha: 'SenhaTeste@123',
    },
  });
  assert.equal(cadastro.status, 201);
  usuarioToken = cadastro.dados.token;

  const equipesPublicas = await chamar('GET', '/api/equipes');
  assert.equal(equipesPublicas.status, 200);
  equipeTesteIds = equipesPublicas.dados.slice(0, 4).map((equipe) => equipe.id);
  assert.equal(equipeTesteIds.length, 4, 'são necessárias quatro equipes públicas de teste');
});

after(async () => {
  if (equipeUploadId) await chamar('DELETE', `/api/equipes/${equipeUploadId}`, { token: adminToken });
  if (modalidadeId) await chamar('DELETE', `/api/modalidades/${modalidadeId}`, { token: adminToken });
  if (partidaId) await chamar('DELETE', `/api/partidas/${partidaId}`, { token: adminToken });
  if (atletaVinculado && atletaId) {
    await chamar('DELETE', `/api/atletas/${atletaId}/equipes/${equipeTesteIds[0]}`, { token: adminToken });
  }
  if (atletaId) await chamar('DELETE', `/api/atletas/${atletaId}`, { token: adminToken });
  if (noticiaId) await chamar('DELETE', `/api/noticias/${noticiaId}`, { token: adminToken });
  if (campeonatoId) {
    if (equipesInscritas) {
      await chamar('DELETE', `/api/campeonatos/${campeonatoId}/equipes/${equipeTesteIds[0]}`, { token: adminToken });
      await chamar('DELETE', `/api/campeonatos/${campeonatoId}/equipes/${equipeTesteIds[1]}`, { token: adminToken });
    }
    await chamar('DELETE', `/api/campeonatos/${campeonatoId}`, { token: adminToken });
  }
});

describe('Proteção administrativa dos novos módulos', () => {
  it('recusa criação sem token (401) e para usuário comum (403)', async () => {
    const rotas = ['/api/modalidades', '/api/atletas', '/api/campeonatos', '/api/partidas', '/api/noticias'];
    for (const rota of rotas) {
      const semToken = await chamar('POST', rota, { corpo: {} });
      assert.equal(semToken.status, 401, `${rota} deveria exigir autenticação`);
      const comum = await chamar('POST', rota, { token: usuarioToken, corpo: {} });
      assert.equal(comum.status, 403, `${rota} deveria exigir administrador`);
    }
  });

  it('recusa upload de imagem sem token ou como usuário comum', async () => {
    const semToken = await chamar('POST', '/api/uploads/equipes/1/logo');
    assert.equal(semToken.status, 401);
    const comum = await chamar('POST', '/api/uploads/equipes/1/logo', { token: usuarioToken });
    assert.equal(comum.status, 403);
  });
});

describe('CRUD de modalidades', () => {
  it('cria, lista, consulta, edita e exclui modalidade', async () => {
    const nome = `Modalidade Teste ${sufixo}`;
    const criada = await chamar('POST', '/api/modalidades', {
      token: adminToken,
      corpo: { nome, tipo: 'esporte', descricao: 'Modalidade temporária de teste.' },
    });
    assert.equal(criada.status, 201);
    modalidadeId = criada.dados.id;

    const lista = await chamar('GET', '/api/modalidades');
    assert.equal(lista.status, 200);
    assert.ok(lista.dados.some((m) => m.id === modalidadeId));

    const consulta = await chamar('GET', `/api/modalidades/${modalidadeId}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.dados.nome, nome);

    const edicao = await chamar('PUT', `/api/modalidades/${modalidadeId}`, {
      token: adminToken,
      corpo: { nome, tipo: 'esport', descricao: 'Atualizada no teste.' },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.tipo, 'esport');

    const remocao = await chamar('DELETE', `/api/modalidades/${modalidadeId}`, { token: adminToken });
    assert.equal(remocao.status, 200);
    const depois = await chamar('GET', `/api/modalidades/${modalidadeId}`);
    assert.equal(depois.status, 404);
    modalidadeId = null;
  });
});

describe('CRUD de atletas e relação equipe_atletas', () => {
  it('lista atletas publicamente', async () => {
    const r = await chamar('GET', '/api/atletas');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.dados));
  });

  it('cria, consulta e atualiza atleta', async () => {
    const criado = await chamar('POST', '/api/atletas', {
      token: adminToken,
      corpo: { nome: `Atleta Teste ${sufixo}`, apelido: 'Teste', bio: 'Registro temporário.' },
    });
    assert.equal(criado.status, 201);
    atletaId = criado.dados.id;
    assert.equal(criado.dados.apelido, 'Teste');

    const consulta = await chamar('GET', `/api/atletas/${atletaId}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.dados.nome, `Atleta Teste ${sufixo}`);

    const edicao = await chamar('PUT', `/api/atletas/${atletaId}`, {
      token: adminToken,
      corpo: { nome: `Atleta Editado ${sufixo}`, apelido: 'Novo', bio: 'Atualizado.' },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.apelido, 'Novo');
  });

  it('cria e remove vínculo de atleta com equipe, mantendo a função', async () => {
    const vinculo = await chamar('POST', `/api/atletas/${atletaId}/equipes`, {
      token: adminToken,
      corpo: { equipe_id: equipeTesteIds[0], funcao: 'Ala' },
    });
    assert.equal(vinculo.status, 201);
    atletaVinculado = true;
    assert.equal(vinculo.dados.equipes[0].funcao, 'Ala');

    const equipe = await chamar('GET', `/api/equipes/${equipeTesteIds[0]}`);
    assert.equal(equipe.status, 200);
    assert.ok(equipe.dados.atletas.some((a) => a.id === atletaId && a.apelido === 'Novo' && a.funcao === 'Ala'));

    const listaPublica = await chamar('GET', '/api/atletas');
    const atletaPublico = listaPublica.dados.find((a) => a.id === atletaId);
    assert.ok(atletaPublico);
    assert.ok(atletaPublico.equipes.some((e) => e.id === equipeTesteIds[0] && e.funcao === 'Ala'));
    assert.equal('usuario_id' in atletaPublico, false);
    assert.equal('usuario_nome' in atletaPublico, false);

    const detalheAdmin = await chamar('GET', `/api/atletas/admin/${atletaId}`, { token: adminToken });
    assert.equal(detalheAdmin.status, 200);
    assert.ok('usuario_id' in detalheAdmin.dados);

    const edicao = await chamar('PUT', `/api/atletas/${atletaId}/equipes/${equipeTesteIds[0]}`, {
      token: adminToken,
      corpo: { funcao: 'Pivô' },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.equipes[0].funcao, 'Pivô');

    const remocao = await chamar('DELETE', `/api/atletas/${atletaId}/equipes/${equipeTesteIds[0]}`, { token: adminToken });
    assert.equal(remocao.status, 200);
    atletaVinculado = false;
  });
});

describe('CRUD de campeonatos e inscrições', () => {
  it('cria, consulta e atualiza campeonato', async () => {
    const criado = await chamar('POST', '/api/campeonatos', {
      token: adminToken,
      corpo: {
        nome: `Campeonato Teste ${sufixo}`,
        edicao: 2026,
        modalidade_id: 2,
        data_inicio: '2026-11-25',
        data_fim: '2026-11-30',
        status: 'planejado',
        descricao: 'Registro temporário de integração.',
      },
    });
    assert.equal(criado.status, 201);
    campeonatoId = criado.dados.id;

    const consulta = await chamar('GET', `/api/campeonatos/${campeonatoId}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.dados.modalidade_nome, 'Futsal');

    const edicao = await chamar('PUT', `/api/campeonatos/${campeonatoId}`, {
      token: adminToken,
      corpo: {
        nome: `Campeonato Teste ${sufixo}`,
        edicao: 2026,
        modalidade_id: 2,
        data_inicio: '2026-11-25',
        data_fim: '2026-12-01',
        status: 'em_andamento',
        descricao: 'Edição atualizada.',
      },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.status, 'em_andamento');
  });

  it('inscreve equipes e impede inscrição repetida ou modalidade incompatível', async () => {
    const primeira = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: equipeTesteIds[0] },
    });
    assert.equal(primeira.status, 201);
    const segunda = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: equipeTesteIds[1] },
    });
    assert.equal(segunda.status, 201);
    equipesInscritas = true;

    const duplicada = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: equipeTesteIds[0] },
    });
    assert.equal(duplicada.status, 409);

    const incompatível = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: 5 },
    });
    assert.equal(incompatível.status, 400);
  });
});

describe('CRUD de partidas', () => {
  it('cria, consulta, filtra e atualiza partida', async () => {
    const corpo = {
      campeonato_id: campeonatoId,
      equipe_casa_id: equipeTesteIds[0],
      equipe_visitante_id: equipeTesteIds[1],
      data_hora: '2026-11-28T19:00',
      fase: 'Fase de grupos',
      placar_casa: 0,
      placar_visitante: 0,
      status: 'finalizada',
      demonstrativo: true,
    };
    const criado = await chamar('POST', '/api/partidas', { token: adminToken, corpo });
    assert.equal(criado.status, 201);
    partidaId = criado.dados.id;

    const consulta = await chamar('GET', `/api/partidas/${partidaId}`);
    assert.equal(consulta.status, 200);
    assert.equal(consulta.dados.demonstrativo, true);

    const filtro = await chamar('GET', `/api/partidas?campeonato_id=${campeonatoId}`);
    assert.equal(filtro.status, 200);
    assert.ok(filtro.dados.some((p) => p.id === partidaId));

    const edicao = await chamar('PUT', `/api/partidas/${partidaId}`, {
      token: adminToken,
      corpo: { ...corpo, placar_casa: 2, placar_visitante: 1 },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.placar_casa, 2);

    const remocao = await chamar('DELETE', `/api/partidas/${partidaId}`, { token: adminToken });
    assert.equal(remocao.status, 200);
    const depois = await chamar('GET', `/api/partidas/${partidaId}`);
    assert.equal(depois.status, 404);
    partidaId = null;
  });

  it('rejeita equipe duplicada, placar negativo e equipes não inscritas', async () => {
    const base = {
      campeonato_id: campeonatoId,
      equipe_casa_id: equipeTesteIds[0],
      equipe_visitante_id: equipeTesteIds[0],
      status: 'agendada',
      demonstrativo: true,
    };
    const iguais = await chamar('POST', '/api/partidas', { token: adminToken, corpo: base });
    assert.equal(iguais.status, 400);

    const negativo = await chamar('POST', '/api/partidas', {
      token: adminToken,
      corpo: { ...base, equipe_visitante_id: equipeTesteIds[1], placar_casa: -1, placar_visitante: 0 },
    });
    assert.equal(negativo.status, 400);

    const semInscricao = await chamar('POST', '/api/partidas', {
      token: adminToken,
      corpo: { ...base, equipe_casa_id: equipeTesteIds[2], equipe_visitante_id: equipeTesteIds[3] },
    });
    assert.equal(semInscricao.status, 400);
  });
});

describe('CRUD de notícias', () => {
  it('cria, consulta, atualiza e exclui notícia', async () => {
    const criado = await chamar('POST', '/api/noticias', {
      token: adminToken,
      corpo: {
        titulo: `Notícia de Teste ${sufixo}`,
        resumo: 'Resumo de teste.',
        conteudo: 'Conteúdo exclusivamente demonstrativo para teste de integração.',
      },
    });
    assert.equal(criado.status, 201);
    noticiaId = criado.dados.id;
    assert.equal(criado.dados.autor_nome, 'Admin CI');

    const lista = await chamar('GET', '/api/noticias');
    assert.equal(lista.status, 200);
    assert.ok(lista.dados.some((n) => n.id === noticiaId));

    const edicao = await chamar('PUT', `/api/noticias/${noticiaId}`, {
      token: adminToken,
      corpo: {
        titulo: `Notícia Editada ${sufixo}`,
        resumo: 'Resumo editado.',
        conteudo: 'Conteúdo atualizado.',
      },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.resumo, 'Resumo editado.');

    const remocao = await chamar('DELETE', `/api/noticias/${noticiaId}`, { token: adminToken });
    assert.equal(remocao.status, 200);
    noticiaId = null;
  });
});

describe('Upload de imagem', () => {
  it('substitui o logo e exclui o arquivo antigo ao apagar a equipe', async () => {
    const criada = await chamar('POST', '/api/equipes', {
      token: adminToken,
      corpo: { nome: `Equipe Upload ${sufixo}`, sigla: `U${sufixo}`, tipo: 'ficticia', modalidade_id: 2 },
    });
    assert.equal(criada.status, 201);
    equipeUploadId = criada.dados.id;

    const primeiro = new FormData();
    primeiro.append('imagem', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }), 'logo.jpg');
    const envioInicial = await chamar('POST', `/api/uploads/equipes/${equipeUploadId}/logo`, { token: adminToken, corpo: primeiro });
    assert.equal(envioInicial.status, 201);
    const urlAntiga = envioInicial.dados.logo_url;

    const segundo = new FormData();
    segundo.append('imagem', new Blob([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' }), 'logo.png');
    const substituicao = await chamar('POST', `/api/uploads/equipes/${equipeUploadId}/logo`, { token: adminToken, corpo: segundo });
    assert.equal(substituicao.status, 201);
    const urlAtual = substituicao.dados.logo_url;
    assert.notEqual(urlAtual, urlAntiga);
    assert.equal((await fetch(BASE + urlAntiga)).status, 404);
    assert.equal((await fetch(BASE + urlAtual)).status, 200);

    const exclusao = await chamar('DELETE', `/api/equipes/${equipeUploadId}`, { token: adminToken });
    assert.equal(exclusao.status, 200);
    assert.equal((await fetch(BASE + urlAtual)).status, 404);
    equipeUploadId = null;
  });

  it('substitui a foto de atleta e elimina a imagem anterior', async () => {
    const primeiro = new FormData();
    primeiro.append('imagem', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }), 'foto.jpg');
    const envioInicial = await chamar('POST', `/api/uploads/atletas/${atletaId}/foto`, { token: adminToken, corpo: primeiro });
    assert.equal(envioInicial.status, 201);
    const urlAntiga = envioInicial.dados.foto_url;

    const segundo = new FormData();
    segundo.append('imagem', new Blob([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' }), 'foto.png');
    const substituicao = await chamar('POST', `/api/uploads/atletas/${atletaId}/foto`, { token: adminToken, corpo: segundo });
    assert.equal(substituicao.status, 201);
    fotoUploadUrl = substituicao.dados.foto_url;
    assert.notEqual(fotoUploadUrl, urlAntiga);
    assert.equal((await fetch(BASE + urlAntiga)).status, 404);
    assert.equal((await fetch(BASE + fotoUploadUrl)).status, 200);
  });

  it('recusa arquivo que não seja imagem permitida', async () => {
    const formulario = new FormData();
    formulario.append('imagem', new Blob(['texto'], { type: 'text/plain' }), 'arquivo.txt');
    const envio = await chamar('POST', '/api/uploads/equipes/1/logo', { token: adminToken, corpo: formulario });
    assert.equal(envio.status, 400);
  });
});

describe('Remoção dos registros de integração', () => {
  it('remove uma inscrição e exclui o campeonato de teste', async () => {
    const retirada = await chamar('DELETE', `/api/campeonatos/${campeonatoId}/equipes/2`, {
      token: adminToken,
    });
    assert.equal(retirada.status, 200);

    const remocao = await chamar('DELETE', `/api/campeonatos/${campeonatoId}`, {
      token: adminToken,
    });
    assert.equal(remocao.status, 200);
    const depois = await chamar('GET', `/api/campeonatos/${campeonatoId}`);
    assert.equal(depois.status, 404);
    campeonatoId = null;
  });

  it('exclui o atleta de teste depois dos testes de vínculo e foto', async () => {
    const remocao = await chamar('DELETE', `/api/atletas/${atletaId}`, { token: adminToken });
    assert.equal(remocao.status, 200);
    const depois = await chamar('GET', `/api/atletas/${atletaId}`);
    assert.equal(depois.status, 404);
    if (fotoUploadUrl) {
      assert.equal((await fetch(BASE + fotoUploadUrl)).status, 404);
      fotoUploadUrl = null;
    }
    atletaId = null;
  });
});
