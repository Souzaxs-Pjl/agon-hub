// =====================================================================
// Testes de integração dos módulos de atletas, campeonatos, partidas,
// notícias e upload. Exigem API e PostgreSQL ativos.
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
let atletaId;
let campeonatoId;
let partidaId;
let noticiaId;
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
});

after(async () => {
  if (partidaId) await chamar('DELETE', `/api/partidas/${partidaId}`, { token: adminToken });
  if (atletaVinculado && atletaId) {
    await chamar('DELETE', `/api/atletas/${atletaId}/equipes/1`, { token: adminToken });
  }
  if (atletaId) await chamar('DELETE', `/api/atletas/${atletaId}`, { token: adminToken });
  if (noticiaId) await chamar('DELETE', `/api/noticias/${noticiaId}`, { token: adminToken });
  if (campeonatoId) {
    if (equipesInscritas) {
      await chamar('DELETE', `/api/campeonatos/${campeonatoId}/equipes/1`, { token: adminToken });
      await chamar('DELETE', `/api/campeonatos/${campeonatoId}/equipes/2`, { token: adminToken });
    }
    await chamar('DELETE', `/api/campeonatos/${campeonatoId}`, { token: adminToken });
  }
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
      corpo: { equipe_id: 1, funcao: 'Ala' },
    });
    assert.equal(vinculo.status, 201);
    atletaVinculado = true;
    assert.equal(vinculo.dados.equipes[0].funcao, 'Ala');

    const equipe = await chamar('GET', '/api/equipes/1');
    assert.equal(equipe.status, 200);
    assert.ok(equipe.dados.atletas.some((a) => a.id === atletaId && a.apelido === 'Novo' && a.funcao === 'Ala'));

    const edicao = await chamar('PUT', `/api/atletas/${atletaId}/equipes/1`, {
      token: adminToken,
      corpo: { funcao: 'Pivô' },
    });
    assert.equal(edicao.status, 200);
    assert.equal(edicao.dados.equipes[0].funcao, 'Pivô');

    const remocao = await chamar('DELETE', `/api/atletas/${atletaId}/equipes/1`, { token: adminToken });
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
      token: adminToken, corpo: { equipe_id: 1 },
    });
    assert.equal(primeira.status, 201);
    const segunda = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: 2 },
    });
    assert.equal(segunda.status, 201);
    equipesInscritas = true;

    const duplicada = await chamar('POST', `/api/campeonatos/${campeonatoId}/equipes`, {
      token: adminToken, corpo: { equipe_id: 1 },
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
      equipe_casa_id: 1,
      equipe_visitante_id: 2,
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
  });

  it('rejeita equipe duplicada, placar negativo e equipes não inscritas', async () => {
    const base = {
      campeonato_id: campeonatoId,
      equipe_casa_id: 1,
      equipe_visitante_id: 1,
      status: 'agendada',
      demonstrativo: true,
    };
    const iguais = await chamar('POST', '/api/partidas', { token: adminToken, corpo: base });
    assert.equal(iguais.status, 400);

    const negativo = await chamar('POST', '/api/partidas', {
      token: adminToken,
      corpo: { ...base, equipe_visitante_id: 2, placar_casa: -1, placar_visitante: 0 },
    });
    assert.equal(negativo.status, 400);

    const semInscricao = await chamar('POST', '/api/partidas', {
      token: adminToken,
      corpo: { ...base, equipe_casa_id: 3, equipe_visitante_id: 4 },
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
  it('aceita JPEG válido, grava a URL e serve o arquivo', async () => {
    // Assinatura mínima suficiente para o validador de formato do endpoint.
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    const formulario = new FormData();
    formulario.append('imagem', new Blob([jpeg], { type: 'image/jpeg' }), 'teste.jpg');
    const envio = await chamar('POST', '/api/uploads/equipes/1/logo', {
      token: adminToken,
      corpo: formulario,
    });
    assert.equal(envio.status, 201);
    assert.match(envio.dados.logo_url, /^\/uploads\/equipe-/);

    const arquivo = await fetch(BASE + envio.dados.logo_url);
    assert.equal(arquivo.status, 200);
    assert.equal(arquivo.headers.get('content-type'), 'image/jpeg');
  });

  it('recusa arquivo que não seja imagem permitida', async () => {
    const formulario = new FormData();
    formulario.append('imagem', new Blob(['texto'], { type: 'text/plain' }), 'arquivo.txt');
    const envio = await chamar('POST', '/api/uploads/equipes/1/logo', {
      token: adminToken,
      corpo: formulario,
    });
    assert.equal(envio.status, 400);
  });
});
