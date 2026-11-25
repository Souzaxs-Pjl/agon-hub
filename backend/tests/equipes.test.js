// =====================================================================
// Testes de INTEGRAÇÃO do CRUD de equipes (chamam a API via HTTP).
//
// Pré-requisitos: banco preenchido, servidor rodando (npm run dev) e
// ADMIN_EMAIL / ADMIN_SENHA no .env (conta criada com npm run criar-admin).
// Executar: npm test   (em outro terminal)
// =====================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}`;

async function chamar(metodo, caminho, { corpo, token } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  const r = await fetch(BASE + caminho, {
    method: metodo,
    headers: cabecalhos,
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  let dados = null;
  try { dados = await r.json(); } catch { /* sem corpo */ }
  return { status: r.status, dados };
}

// Sigla única por execução (máximo 10 caracteres).
const sufixo = String(Date.now()).slice(-6);
const sigla = `T${sufixo}`;
const nomeEquipe = `Equipe Teste ${sufixo}`;

let tokenAdmin;
let tokenComum;
let equipeId;
const emailComum = `teste.equipes.${Date.now()}@agonhub.example`;

before(async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_SENHA) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA no backend/.env (e rode npm run criar-admin).');
  }
  const login = await chamar('POST', '/api/auth/login', {
    corpo: { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA },
  });
  assert.equal(login.status, 200, 'login do admin falhou: rode npm run criar-admin');
  tokenAdmin = login.dados.token;

  const cadastro = await chamar('POST', '/api/auth/register', {
    corpo: { nome: 'Comum Teste', email: emailComum, senha: 'SenhaTeste@123' },
  });
  tokenComum = cadastro.dados.token;
});

after(async () => {
  // Limpa a equipe criada pelo teste, se ainda existir.
  if (equipeId) await chamar('DELETE', `/api/equipes/${equipeId}`, { token: tokenAdmin });
});

describe('Leitura pública de equipes', () => {
  it('GET /api/equipes lista sem precisar de login', async () => {
    const { status, dados } = await chamar('GET', '/api/equipes');
    assert.equal(status, 200);
    assert.ok(Array.isArray(dados) && dados.length > 0);
    assert.ok('modalidade_nome' in dados[0], 'deve trazer o nome da modalidade');
  });

  it('GET /api/equipes/999999 responde 404', async () => {
    const { status } = await chamar('GET', '/api/equipes/999999');
    assert.equal(status, 404);
  });

  it('GET /api/equipes/abc responde 400', async () => {
    const { status } = await chamar('GET', '/api/equipes/abc');
    assert.equal(status, 400);
  });
});

describe('Criação de equipe', () => {
  const corpo = {
    nome: nomeEquipe,
    sigla,
    tipo: 'ficticia',
    modalidade_id: 2, // Futsal, do seed
    descricao: 'Equipe criada pelo teste automatizado.',
  };

  it('usuário sem login não consegue criar (401)', async () => {
    const { status } = await chamar('POST', '/api/equipes', { corpo });
    assert.equal(status, 401);
  });

  it('usuário comum não consegue criar (403)', async () => {
    const { status } = await chamar('POST', '/api/equipes', { corpo, token: tokenComum });
    assert.equal(status, 403);
  });

  it('admin cria a equipe (201) e ela aparece com a modalidade', async () => {
    const { status, dados } = await chamar('POST', '/api/equipes', { corpo, token: tokenAdmin });
    assert.equal(status, 201);
    assert.equal(dados.nome, nomeEquipe);
    assert.equal(dados.modalidade_nome, 'Futsal');
    assert.deepEqual(dados.atletas, []);
    equipeId = dados.id;
  });

  it('a equipe criada aparece na leitura pública', async () => {
    const { status, dados } = await chamar('GET', `/api/equipes/${equipeId}`);
    assert.equal(status, 200);
    assert.equal(dados.sigla, sigla);
  });

  it('sigla repetida devolve 409 com mensagem clara', async () => {
    const { status, dados } = await chamar('POST', '/api/equipes', {
      corpo: { ...corpo, nome: `${nomeEquipe} B` },
      token: tokenAdmin,
    });
    assert.equal(status, 409);
    assert.match(dados.erro, /sigla/);
  });

  it('modalidade inexistente devolve 400 (não 500)', async () => {
    const { status } = await chamar('POST', '/api/equipes', {
      corpo: { ...corpo, sigla: `X${sufixo}`, nome: `Outra ${sufixo}`, modalidade_id: 999999 },
      token: tokenAdmin,
    });
    assert.equal(status, 400);
  });

  it('dados inválidos devolvem 400 com a lista de erros', async () => {
    const { status, dados } = await chamar('POST', '/api/equipes', {
      corpo: { nome: 'X' },
      token: tokenAdmin,
    });
    assert.equal(status, 400);
    assert.ok(dados.detalhes.length > 0);
  });
});

describe('Edição e exclusão', () => {
  it('admin altera a equipe (PUT)', async () => {
    const { status, dados } = await chamar('PUT', `/api/equipes/${equipeId}`, {
      corpo: { nome: `${nomeEquipe} Editada`, sigla, tipo: 'real', modalidade_id: 2, instituicao: 'Escola Teste' },
      token: tokenAdmin,
    });
    assert.equal(status, 200);
    assert.equal(dados.tipo, 'real');
    assert.equal(dados.instituicao, 'Escola Teste');
  });

  it('usuário comum não consegue alterar (403)', async () => {
    const { status } = await chamar('PUT', `/api/equipes/${equipeId}`, {
      corpo: { nome: 'Invasão', sigla, tipo: 'real', modalidade_id: 2 },
      token: tokenComum,
    });
    assert.equal(status, 403);
  });

  it('admin exclui a equipe (200) e ela deixa de existir (404)', async () => {
    const apagar = await chamar('DELETE', `/api/equipes/${equipeId}`, { token: tokenAdmin });
    assert.equal(apagar.status, 200);
    const depois = await chamar('GET', `/api/equipes/${equipeId}`);
    assert.equal(depois.status, 404);
    equipeId = null; // já apagada: o "after" não precisa tentar de novo
  });
});
