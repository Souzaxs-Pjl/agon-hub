// =====================================================================
// server.js - ponto de entrada do backend.
// =====================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/erros');

const segredo = process.env.JWT_SECRET || '';
if (segredo.length < 32 || segredo.startsWith('troque-')) {
  console.error(
    'ERRO: defina um JWT_SECRET forte (32+ caracteres) no arquivo backend/.env.\n' +
    "Para gerar um: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
  process.exit(1);
}

const app = express();
const origensPermitidas = new Set([
  'http://localhost:5173',
  'https://agon-hub-frontend.vercel.app',
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(','),
].map((origem) => {
  try { return new URL((origem || '').trim()).origin; } catch { return ''; }
}).filter(Boolean));

app.use(cors({
  origin: (origem, callback) => {
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

async function iniciar() {
  try {
    await db.query('SELECT 1');
    console.log('Conectado ao PostgreSQL.');
    const resultadoBaseDemo = await require('./migrations/002_base_real_2026')(db);
    console.log(resultadoBaseDemo.aplicada ? `Base demonstrativa AGON importada: ${resultadoBaseDemo.equipes} equipes e ${resultadoBaseDemo.atletas} atletas fictícios.` : 'Migração da base demonstrativa já aplicada.');
    const resultadoConteudoDemo = await require('./migrations/003_conteudo_demo_2026')(db);
    console.log(resultadoConteudoDemo.aplicada ? `Conteúdo demonstrativo criado: ${resultadoConteudoDemo.atletas} atletas adicionais, ${resultadoConteudoDemo.campeonatos} campeonatos, ${resultadoConteudoDemo.partidas} partidas e ${resultadoConteudoDemo.noticias} notícias.` : 'Migração do conteúdo demonstrativo já aplicada.');
    await require('./migrations/004_schema_comunidade')(db);
    console.log('Schema da comunidade verificado.');
    await require('./migrations/005_calendario_nacional_demo')(db);
    console.log('Calendário demonstrativo verificado.');
    await require('./migrations/006_urls_imagem_sem_limite')(db);
    console.log('Campos de URL de imagem sem limite de caracteres verificados.');
    const resultadoBasePublica = await require('./migrations/007_publicar_base_real_2026')(db);
    console.log(
      resultadoBasePublica.aplicada
        ? `Base esportiva real publicada: ${resultadoBasePublica.equipes} equipes, ${resultadoBasePublica.atletas} atletas e ${resultadoBasePublica.perfisPublicos} perfis públicos; ${resultadoBasePublica.demonstrativosOcultos} perfis demonstrativos ocultados.`
        : 'Migração da base esportiva real já aplicada.'
    );
  } catch (erro) {
    console.error(
      'ERRO: não foi possível conectar ao PostgreSQL.\n' +
      'Confira se o PostgreSQL está rodando e se as variáveis DB_* do arquivo backend/.env estão corretas.\n' +
      'Detalhe: ' + erro.message
    );
    process.exit(1);
  }

  const porta = Number(process.env.PORT) || 3000;
  app.listen(porta, () => {
    console.log(`API do AGON Hub rodando em http://localhost:${porta}`);
  });
}

iniciar();
