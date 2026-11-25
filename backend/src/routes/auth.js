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
const { limparImagemSeNaoUtilizada } = require('../arquivos');

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
       RETURNING id, nome, email, papel, bio, foto_url, perfil_publico, criado_em`,
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
    'SELECT id, nome, email, papel, senha_hash, bio, foto_url, perfil_publico, criado_em FROM usuarios WHERE email = $1',
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
    usuario: {
      id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel,
      bio: usuario.bio, foto_url: usuario.foto_url, perfil_publico: usuario.perfil_publico,
      criado_em: usuario.criado_em,
    },
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


// PUT /api/auth/me: cada pessoa só consegue alterar a própria conta.
router.put('/me', autenticar, async (req, res) => {
  const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
  const bio = typeof req.body?.bio === 'string' && req.body.bio.trim()
    ? req.body.bio.trim()
    : null;
  const fotoUrl = typeof req.body?.foto_url === 'string' && req.body.foto_url.trim()
    ? req.body.foto_url.trim()
    : null;
  const perfilPublico = req.body?.perfil_publico;

  const erros = [];
  if (nome.length < 2 || nome.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }
  if (bio && bio.length > 3000) {
    erros.push('A biografia deve ter no máximo 3000 caracteres.');
  }
  if (fotoUrl && (fotoUrl.length > 255 || !REGEX_URL_IMAGEM.test(fotoUrl))) {
    erros.push('A foto deve ser uma URL http(s) válida ou um arquivo enviado ao AGON Hub.');
  }
  if (typeof perfilPublico !== 'boolean') {
    erros.push('Escolha se o perfil será público ou privado.');
  }
  if (erros.length) {
    return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
  }

  const anterior = req.usuario.foto_url;
  const { rows } = await db.query(
    `UPDATE usuarios
     SET nome = $1, bio = $2, foto_url = $3, perfil_publico = $4
     WHERE id = $5
     RETURNING id, nome, email, papel, bio, foto_url, perfil_publico, criado_em`,
    [nome, bio, fotoUrl, perfilPublico, req.usuario.id]
  );

  if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  if (anterior !== fotoUrl) await limparImagemSeNaoUtilizada(anterior);

  res.json({ usuario: rows[0] });
});

module.exports = router;
