// =====================================================================
// Testes de INTEGRAÇÃO da autenticação e autorização.
// Chamam a API de verdade (HTTP), então:
//   1) o banco precisa estar criado e preenchido (schema.sql + seed.sql);
//   2) o servidor precisa estar rodando em outro terminal (npm run dev);
//   3) para os testes de administrador, rode antes: npm run criar-admin
//      (eles usam ADMIN_EMAIL e ADMIN_SENHA do seu .env; se não existirem,
//      esses testes são pulados).
//
// Executar: npm test   (dentro da pasta backend)
//
// Cada execução cria alguns usuários "teste.<número>@agonhub.example".
// Para limpá-los depois:
//   DELETE FROM usuarios WHERE email LIKE 'teste.%@agonhub.example';
// =====================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const BASE = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}`;

// Faz uma requisição e devolve { status, dados }.
async function chamar(metodo, caminho, { corpo, token } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  const resposta = await fetch(BASE + caminho, {
    method: metodo,
    headers: cabecalhos,
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem corpo JSON
  }
  return { status: resposta.status, dados };
}

// E-mail único por execução, para não colidir com testes anteriores.
const emailTeste = `teste.${Date.now()}@agonhub.example`;
const senhaTeste = 'SenhaTeste@123';
let usuarioComum; // preenchido no teste de cadastro
let tokenComum;

const temAdmin = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_SENHA);

before(async () => {
  try {
    await fetch(`${BASE}/api/saude`);
  } catch {
    throw new Error(
      `Não consegui falar com a API em ${BASE}. Inicie o servidor em outro terminal (npm run dev) e tente de novo.`
    );
  }
});

describe('Saúde', () => {
  it('GET /api/saude responde 200 com banco ok', async () => {
    const { status, dados } = await chamar('GET', '/api/saude');
    assert.equal(status, 200);
    assert.equal(dados.banco, 'ok');
  });
});

describe('Cadastro (POST /api/auth/register)', () => {
  it('cria um usuário comum e devolve um token', async () => {
    const { status, dados } = await chamar('POST', '/api/auth/register', {
      corpo: { nome: 'Usuário de Teste', email: emailTeste, senha: senhaTeste },
    });
    assert.equal(status, 201);
    assert.equal(dados.usuario.papel, 'usuario');
    assert.equal(dados.usuario.email, emailTeste);
    assert.equal(typeof dados.token, 'string');
    // O hash da senha nunca pode sair do servidor
    assert.equal('senha_hash' in dados.usuario, false);
    assert.equal('senha' in dados.usuario, false);
    usuarioComum = dados.usuario;
    tokenComum = dados.token;
  });

  it('ignora o campo "papel" enviado: ninguém se cadastra como admin', async () => {
    const { status, dados } = await chamar('POST', '/api/auth/register', {
      corpo: {
        nome: 'Espertinho',
        email: `teste.admin.${Date.now()}@agonhub.example`,
        senha: senhaTeste,
        papel: 'admin',
      },
    });
    assert.equal(status, 201);
    assert.equal(dados.usuario.papel, 'usuario');
  });

  it('rejeita e-mail repetido, mesmo com letras maiúsculas (409)', async () => {
    const { status } = await chamar('POST', '/api/auth/register', {
      corpo: { nome: 'Outro Nome', email: emailTeste.toUpperCase(), senha: senhaTeste },
    });
    assert.equal(status, 409);
  });

  it('rejeita dados inválidos (400)', async () => {
    const casos = [
      { nome: 'Ana', email: 'sem-arroba', senha: senhaTeste },
      { nome: 'Ana', email: 'ana.valida@agonhub.example', senha: '123' },
      { nome: '', email: 'ana.valida@agonhub.example', senha: senhaTeste },
      {},
    ];
    for (const corpo of casos) {
      const { status } = await chamar('POST', '/api/auth/register', { corpo });
      assert.equal(status, 400, `esperava 400 para ${JSON.stringify(corpo)}`);
    }
  });
});

describe('Login (POST /api/auth/login)', () => {
  it('entra com a conta recém-criada', async () => {
    const { status, dados } = await chamar('POST', '/api/auth/login', {
      corpo: { email: emailTeste, senha: senhaTeste },
    });
    assert.equal(status, 200);
    assert.equal(typeof dados.token, 'string');
    assert.equal(dados.usuario.papel, 'usuario');
  });

  it('entra com usuário do seed (maria@agonhub.example)', async () => {
    const { status } = await chamar('POST', '/api/auth/login', {
      corpo: { email: 'maria@agonhub.example', senha: 'Senha@123' },
    });
    assert.equal(status, 200);
  });

  it('não diferencia maiúsculas/minúsculas no e-mail', async () => {
    const { status } = await chamar('POST', '/api/auth/login', {
      corpo: { email: emailTeste.toUpperCase(), senha: senhaTeste },
    });
    assert.equal(status, 200);
  });

  it('recusa senha errada e e-mail inexistente com a MESMA mensagem (401)', async () => {
    const errada = await chamar('POST', '/api/auth/login', {
      corpo: { email: emailTeste, senha: 'senha-errada-123' },
    });
    const inexistente = await chamar('POST', '/api/auth/login', {
      corpo: { email: 'ninguem@agonhub.example', senha: senhaTeste },
    });
    assert.equal(errada.status, 401);
    assert.equal(inexistente.status, 401);
    assert.equal(errada.dados.erro, inexistente.dados.erro);
  });

  it('não deixa entrar na conta editorial do seed (sem senha utilizável)', async () => {
    const { status } = await chamar('POST', '/api/auth/login', {
      corpo: { email: 'redacao@agonhub.example', senha: '!' },
    });
    assert.equal(status, 401);
  });

  it('pede e-mail e senha quando faltam (400)', async () => {
    const { status } = await chamar('POST', '/api/auth/login', { corpo: { email: emailTeste } });
    assert.equal(status, 400);
  });
});

describe('Token JWT (GET /api/auth/me)', () => {
  it('sem token: 401', async () => {
    const { status } = await chamar('GET', '/api/auth/me');
    assert.equal(status, 401);
  });

  it('token inválido: 401', async () => {
    const { status } = await chamar('GET', '/api/auth/me', { token: 'isto.nao.eh-um-token' });
    assert.equal(status, 401);
  });

  it('token assinado com outro segredo (forjado): 401', async () => {
    const falso = jwt.sign({ sub: String(usuarioComum.id) }, 'segredo-errado-que-o-atacante-inventou');
    const { status } = await chamar('GET', '/api/auth/me', { token: falso });
    assert.equal(status, 401);
  });

  it('token expirado: 401', async () => {
    const expirado = jwt.sign({ sub: String(usuarioComum.id) }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const { status } = await chamar('GET', '/api/auth/me', { token: expirado });
    assert.equal(status, 401);
  });

  it('token válido: 200 e devolve o usuário', async () => {
    const { status, dados } = await chamar('GET', '/api/auth/me', { token: tokenComum });
    assert.equal(status, 200);
    assert.equal(dados.usuario.email, emailTeste);
  });
});

describe('Autorização de administrador (GET /api/usuarios)', () => {
  it('sem token: 401', async () => {
    const { status } = await chamar('GET', '/api/usuarios');
    assert.equal(status, 401);
  });

  it('usuário comum: 403', async () => {
    const { status } = await chamar('GET', '/api/usuarios', { token: tokenComum });
    assert.equal(status, 403);
  });

  it('token com "papel: admin" inventado dentro dele continua sendo 403', async () => {
    // Mesmo assinado com o segredo certo, o papel no token é ignorado:
    // o servidor consulta o papel real no banco.
    const adulterado = jwt.sign(
      { sub: String(usuarioComum.id), papel: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    const { status } = await chamar('GET', '/api/usuarios', { token: adulterado });
    assert.equal(status, 403);
  });

  it('administrador: 200 e lista de usuários sem senha_hash', { skip: !temAdmin && 'defina ADMIN_EMAIL/ADMIN_SENHA no .env e rode npm run criar-admin' }, async () => {
    const login = await chamar('POST', '/api/auth/login', {
      corpo: { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA },
    });
    assert.equal(login.status, 200, 'rode "npm run criar-admin" antes dos testes');
    assert.equal(login.dados.usuario.papel, 'admin');

    const { status, dados } = await chamar('GET', '/api/usuarios', { token: login.dados.token });
    assert.equal(status, 200);
    assert.ok(Array.isArray(dados));
    assert.ok(dados.length >= 4);
    assert.equal('senha_hash' in dados[0], false);
  });
});

describe('Erros gerais', () => {
  it('rota inexistente: 404', async () => {
    const { status } = await chamar('GET', '/api/nao-existe');
    assert.equal(status, 404);
  });

  it('JSON mal formado: 400', async () => {
    const resposta = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ isto não é json',
    });
    assert.equal(resposta.status, 400);
  });
});
