// =====================================================================
// server.js - ponto de entrada do backend
//
// Monta o aplicativo Express: carrega o .env, liga os middlewares
// (CORS, leitura de JSON), registra as rotas e o tratamento de erros,
// confere a conexão com o banco e começa a escutar na porta.
// =====================================================================
const path = require('path');

// 1) Carrega o arquivo .env (backend/.env) para process.env.
//    Precisa vir ANTES de qualquer require que use as variáveis (como o db).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/erros');

// 2) Confere a configuração obrigatória antes de subir o servidor.
//    Um JWT_SECRET fraco ou copiado do exemplo deixaria o sistema inseguro.
const segredo = process.env.JWT_SECRET || '';
if (segredo.length < 32 || segredo.startsWith('troque-')) {
  console.error(
    'ERRO: defina um JWT_SECRET forte (32+ caracteres) no arquivo backend/.env.\n' +
      "Para gerar um: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
  );
  process.exit(1);
}

const app = express();

// 3) Middlewares globais (rodam em toda requisição, nesta ordem)
// CORS: permite que o frontend (outra porta) converse com esta API.
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
// Lê o corpo das requisições em JSON e o disponibiliza em req.body.
app.use(express.json({ limit: '1mb' }));

// 4) Rotas
// Rota de saúde: confirma que o servidor E o banco estão funcionando.
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
// (as rotas de equipes, atletas, campeonatos etc. serão adicionadas aqui)

// 5) Por último: rota inexistente (404) e tratador central de erros.
app.use(rotaNaoEncontrada);
app.use(tratarErros);

// 6) Confere o banco e só então começa a escutar.
async function iniciar() {
  try {
    await db.query('SELECT 1');
    console.log('Conectado ao PostgreSQL.');
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
