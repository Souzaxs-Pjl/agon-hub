// =====================================================================
// routes/auth.js - cadastro, login e "quem sou eu"
//
// Rotas (todas com prefixo /api/auth, definido no server.js):
//   POST /register  -> cria uma conta de usuário comum        (pública)
//   POST /login     -> confere e-mail/senha e devolve o token (pública)
//   GET  /me        -> devolve os dados do usuário logado     (exige token)
// =====================================================================
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { gerarToken, autenticar } = require('../middlewares/auth');
const { normalizarEmail, validarCadastro } = require('../validacao');

const router = express.Router();

// "Custo" do bcrypt: quanto maior, mais lento (e mais difícil de quebrar
// por força bruta). 10 é o padrão recomendado para este tipo de projeto.
const CUSTO_BCRYPT = 10;

// Hash de uma senha que ninguém conhece. Usado no login quando o e-mail
// não existe: assim a resposta demora o mesmo tempo nos dois casos e
// ninguém consegue descobrir, pelo tempo, quais e-mails estão cadastrados.
const HASH_FALSO = bcrypt.hashSync('senha-que-ninguem-usa', CUSTO_BCRYPT);

// ---------------------------------------------------------------------
// POST /api/auth/register
// Corpo: { "nome": "...", "email": "...", "senha": "..." }
// ---------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { erros, nome, email } = validarCadastro(req.body);
  if (erros.length > 0) {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  }

  // Guardamos só o HASH da senha, nunca a senha em si.
  const senhaHash = await bcrypt.hash(req.body.senha, CUSTO_BCRYPT);

  try {
    // SEGURANÇA: o papel 'usuario' está escrito DIRETO no SQL. O campo
    // "papel" que o cliente eventualmente envie no corpo é ignorado:
    // ninguém consegue se cadastrar como administrador.
    const { rows } = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel)
       VALUES ($1, $2, $3, 'usuario')
       RETURNING id, nome, email, papel, criado_em`,
      [nome, email, senhaHash]
    );
    const usuario = rows[0];
    res.status(201).json({ usuario, token: gerarToken(usuario.id) });
  } catch (erro) {
    // 23505 = e-mail já cadastrado (restrição UNIQUE do banco)
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    throw erro; // outros erros vão para o tratador central
  }
});

// ---------------------------------------------------------------------
// POST /api/auth/login
// Corpo: { "email": "...", "senha": "..." }
// ---------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const email = normalizarEmail(req.body?.email);
  const senha = req.body?.senha;

  if (!email || typeof senha !== 'string' || senha === '') {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  const { rows } = await db.query(
    'SELECT id, nome, email, papel, senha_hash FROM usuarios WHERE email = $1',
    [email]
  );
  const usuario = rows[0];

  // bcrypt.compare refaz o hash da senha digitada e compara com o salvo.
  let senhaConfere = false;
  try {
    senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senha_hash : HASH_FALSO);
  } catch {
    senhaConfere = false; // hash inválido no banco (ex.: conta sem senha)
  }

  // Mesma mensagem para "e-mail não existe" e "senha errada", para não
  // revelar quais e-mails estão cadastrados.
  if (!usuario || !senhaConfere) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  res.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    token: gerarToken(usuario.id),
  });
});

// ---------------------------------------------------------------------
// GET /api/auth/me   (exige token)
// O frontend usa para saber quem está logado ao abrir a página.
// ---------------------------------------------------------------------
router.get('/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
