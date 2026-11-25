// =====================================================================
// server.js - ponto de entrada do backend.
// =====================================================================
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
const { REGEX_EMAIL, normalizarEmail, validarSenha } = require('./validacao');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/erros');

const segredo = process.env.JWT_SECRET || '';
if (segredo.length < 32 || segredo.startsWith('troque-')) {
  console.error('ERRO: defina um JWT_SECRET forte (32+ caracteres) nas variáveis de ambiente.');
  process.exit(1);
}

const app = express();
const origensConfiguradas = [
  'https://agon-hub-frontend.vercel.app',
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(','),
].map((origem) => (origem || '').trim()).filter(Boolean);
const origensPermitidas = new Set([
  'http://localhost:5173',
  ...origensConfiguradas,
].map((origem) => {
  try { return new URL(origem).origin; } catch { return ''; }
}).filter(Boolean));

app.use(cors({
  origin: (origem, callback) => {
    // Requisições sem Origin (ex.: health checks) são permitidas.
    const origemNormalizada = (() => {
      try { return new URL(origem).origin; } catch { return ''; }
    })();
    if (!origem || origensPermitidas.has(origemNormalizada)) return callback(null, true);
    console.warn('CORS rejeitou a origem:', origem);
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
}));
app.use(express.json({ limit: '1mb' }));

// Imagens enviadas por administradores ficam disponíveis em /uploads.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/saude', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', banco: 'ok' });
  } catch {
    res.status(503).json({ status: 'erro', banco: 'indisponivel' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/modalidades', require('./routes/modalidades'));
app.use('/api/equipes', require('./routes/equipes'));
app.use('/api/atletas', require('./routes/atletas'));
app.use('/api/campeonatos', require('./routes/campeonatos'));
app.use('/api/partidas', require('./routes/partidas'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/comunidade', require('./routes/comunidade'));
app.use('/api/uploads', require('./routes/uploads'));

app.use(rotaNaoEncontrada);
app.use(tratarErros);

// Prepara apenas o banco da implantação: cria tabelas ausentes e carrega
// o seed demonstrativo somente quando ainda não há usuários cadastrados.
// Os arquivos SQL ficam no diretório database/ da raiz do repositório.
async function prepararBanco() {
  const raizRepositorio = path.resolve(__dirname, '..', '..');
  const schema = fs.readFileSync(path.join(raizRepositorio, 'database', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(raizRepositorio, 'database', 'seed.sql'), 'utf8');
  const comunidade = fs.readFileSync(path.join(raizRepositorio, 'database', 'migrations', '001_comunidade.sql'), 'utf8');

  await db.pool.query(schema);
  await db.pool.query(comunidade);

  const { rows } = await db.query('SELECT COUNT(*)::int AS total FROM usuarios');
  if (rows[0].total === 0) {
    await db.pool.query(seed);
    console.log('Banco inicializado com dados demonstrativos.');
  } else {
    console.log('Banco existente detectado; seed não foi reaplicado.');
  }
}

// Cria/atualiza o administrador usando credenciais armazenadas apenas
// nas variáveis de ambiente da hospedagem.
async function prepararAdministrador() {
  const emailInformado = process.env.ADMIN_EMAIL || '';
  const senha = process.env.ADMIN_SENHA || '';
  if (!emailInformado && !senha) {
    console.warn('ADMIN_EMAIL/ADMIN_SENHA não configurados; sem administrador inicial.');
    return;
  }

  const email = normalizarEmail(emailInformado);
  const nome = (process.env.ADMIN_NOME || 'Administrador AGON').trim();
  if (!REGEX_EMAIL.test(email)) throw new Error('ADMIN_EMAIL inválido nas variáveis de ambiente.');
  const erroSenha = validarSenha(senha);
  if (erroSenha) throw new Error('ADMIN_SENHA inválida nas variáveis de ambiente. ' + erroSenha);
  if (nome.length < 2 || nome.length > 100) throw new Error('ADMIN_NOME deve ter entre 2 e 100 caracteres.');

  const senhaHash = await bcrypt.hash(senha, 10);
  await db.query(
    `INSERT INTO usuarios (nome, email, senha_hash, papel)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET nome = EXCLUDED.nome,
                   senha_hash = EXCLUDED.senha_hash,
                   papel = 'admin'`,
    [nome, email, senhaHash]
  );
  console.log('Administrador de implantação configurado.');
}

async function iniciar() {
  try {
    await db.query('SELECT 1');
    console.log('Conectado ao PostgreSQL.');
    await prepararBanco();
    const resultadoBaseReal = await require('./migrations/002_base_real_2026')(db);
    console.log(resultadoBaseReal.aplicada ? `Base real AGON importada: ${resultadoBaseReal.equipes} equipes e ${resultadoBaseReal.atletas} atletas.` : 'Migração da base real já aplicada.');
    await prepararAdministrador();
  } catch (erro) {
    console.error(
      'ERRO na preparação do backend/banco. Confira as variáveis e os arquivos SQL.\n' +
      'Detalhe: ' + erro.message
    );
    process.exit(1);
  }

  const porta = Number(process.env.PORT) || 3000;
  app.listen(porta, () => {
    console.log(`API do AGON Hub rodando na porta ${porta}`);
  });
}

iniciar();
