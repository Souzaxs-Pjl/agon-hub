// Testes de integração das consultas públicas e dos endpoints administrativos.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}`;
let tokenAdmin;

async function chamar(metodo, caminho, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const resposta = await fetch(BASE + caminho, { method: metodo, headers });
  let dados = null;
  try { dados = await resposta.json(); } catch { /* resposta sem JSON */ }
  return { status: resposta.status, dados };
}

before(async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_SENHA) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA para executar os testes de integração.');
  }
  const login = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA }),
  });
  const dados = await login.json();
  assert.equal(login.status, 200, 'login administrativo necessário para os testes');
  tokenAdmin = dados.token;
});

describe('Base esportiva pública', () => {
  it('expõe somente atletas com perfil público autorizado', async () => {
    const [publicos, administrativos] = await Promise.all([
      chamar('GET', '/api/atletas'),
      chamar('GET', '/api/atletas/admin', tokenAdmin),
    ]);

    assert.equal(publicos.status, 200);
    assert.equal(administrativos.status, 200);
    assert.ok(Array.isArray(publicos.dados));
    assert.ok(Array.isArray(administrativos.dados));
    assert.ok(administrativos.dados.length >= 318, 'a base real deve conter 318 atletas');
    const autorizados = new Set(
      administrativos.dados.filter((atleta) => atleta.perfil_publico === true).map((atleta) => atleta.id)
    );
    assert.ok(publicos.dados.every((atleta) => autorizados.has(atleta.id)));
    assert.ok(
      administrativos.dados.filter((atleta) => atleta.perfil_publico === false).length >= 2,
      'cadastros em revisão devem permanecer privados'
    );
  });
});

describe('Conteúdo demonstrativo', () => {
  const recursos = [
    { nome: 'campeonatos', rota: '/api/campeonatos' },
    { nome: 'partidas', rota: '/api/partidas' },
    { nome: 'noticias', rota: '/api/noticias' },
  ];

  for (const recurso of recursos) {
    it(`mantém ${recurso.nome} demonstrativos apenas no painel administrativo`, async () => {
      const [publicos, administrativos] = await Promise.all([
        chamar('GET', recurso.rota),
        chamar('GET', `${recurso.rota}/admin`, tokenAdmin),
      ]);

      assert.equal(publicos.status, 200);
      assert.equal(administrativos.status, 200);
      assert.ok(Array.isArray(publicos.dados));
      assert.ok(Array.isArray(administrativos.dados));

      const porId = new Map(administrativos.dados.map((item) => [item.id, item]));
      assert.ok(publicos.dados.every((item) => porId.has(item.id) && !porId.get(item.id).demonstrativo));

      const demonstrativo = administrativos.dados.find((item) => item.demonstrativo === true);
      assert.ok(demonstrativo, `deve existir conteúdo demonstrativo de ${recurso.nome} para validar a proteção`);

      const detalhePublico = await chamar('GET', `${recurso.rota}/${demonstrativo.id}`);
      const detalheAdmin = await chamar('GET', `${recurso.rota}/admin/${demonstrativo.id}`, tokenAdmin);
      assert.equal(detalhePublico.status, 404);
      assert.equal(detalheAdmin.status, 200);
    });
  }
});
