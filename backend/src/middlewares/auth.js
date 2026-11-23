// =====================================================================
// auth.js - autenticação (JWT) e autorização (papel de administrador)
//
// Dois conceitos diferentes:
//   AUTENTICAÇÃO = "quem é você?"     -> middleware autenticar
//   AUTORIZAÇÃO  = "você pode fazer isso?" -> middleware exigirAdmin
//
// Como usar nas rotas (a ordem importa: primeiro autenticar):
//   router.get('/algo', autenticar, handler);               // qualquer usuário logado
//   router.post('/algo', autenticar, exigirAdmin, handler); // só administrador
//
// Códigos HTTP:
//   401 Unauthorized = não está logado (sem token, token inválido ou expirado)
//   403 Forbidden    = está logado, mas não tem permissão
// =====================================================================
const jwt = require('jsonwebtoken');
const db = require('../db');

// Cria o token JWT de um usuário.
// DECISÃO DE SEGURANÇA: o token guarda SÓ o id do usuário (campo "sub").
// O papel (admin/usuario) NÃO vai no token: ele é lido do banco a cada
// requisição. Assim, se um admin for rebaixado ou apagado, o efeito é
// imediato, e ninguém consegue "inventar" um token com papel de admin.
function gerarToken(idUsuario) {
  return jwt.sign({ sub: String(idUsuario) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

// Middleware: exige um token válido no cabeçalho
//   Authorization: Bearer <token>
// Se estiver tudo certo, coloca os dados do usuário em req.usuario.
async function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      erro: 'Autenticação necessária. Envie o cabeçalho Authorization: Bearer <token>.',
    });
  }

  let payload;
  try {
    // verify confere a assinatura e a validade. Restringimos o algoritmo
    // a HS256 para evitar ataques com algoritmos inesperados.
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (erro) {
    const mensagem =
      erro.name === 'TokenExpiredError'
        ? 'Sessão expirada. Faça login novamente.'
        : 'Token inválido.';
    return res.status(401).json({ erro: mensagem });
  }

  const id = Number(payload.sub);
  if (!Number.isInteger(id)) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }

  // Busca o usuário e o papel ATUAL no banco.
  const { rows } = await db.query(
    'SELECT id, nome, email, papel FROM usuarios WHERE id = $1',
    [id]
  );
  if (rows.length === 0) {
    return res.status(401).json({ erro: 'O usuário deste token não existe mais.' });
  }

  req.usuario = rows[0];
  next();
}

// Middleware: só deixa passar administradores.
// Deve vir DEPOIS de autenticar (que preenche req.usuario).
function exigirAdmin(req, res, next) {
  if (!req.usuario || req.usuario.papel !== 'admin') {
    return res.status(403).json({
      erro: 'Acesso negado. Esta operação é exclusiva de administradores.',
    });
  }
  next();
}

module.exports = { gerarToken, autenticar, exigirAdmin };
