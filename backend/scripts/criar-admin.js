// =====================================================================
// criar-admin.js - cria (ou atualiza) a conta de administrador
//
// Uso (na pasta backend, com o banco já criado e o .env preenchido):
//     npm run criar-admin
//
// Lê ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA do arquivo .env, gera o hash
// bcrypt da senha e grava no banco. Assim NENHUMA senha de administrador
// fica escrita no repositório: ela só existe no seu .env (que não vai
// para o Git).
//
// Pode ser executado várias vezes: se o e-mail já existir, a conta é
// atualizada (nome, senha e papel 'admin').
// =====================================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const db = require('../src/db');
const { REGEX_EMAIL, normalizarEmail, validarSenha } = require('../src/validacao');

async function main() {
  const nome = (process.env.ADMIN_NOME || 'Administrador AGON').trim();
  const email = normalizarEmail(process.env.ADMIN_EMAIL);
  const senha = process.env.ADMIN_SENHA || '';

  // Confere os dados antes de tocar no banco.
  if (!REGEX_EMAIL.test(email)) {
    throw new Error('Defina um ADMIN_EMAIL válido no arquivo backend/.env.');
  }
  const erroSenha = validarSenha(senha);
  if (erroSenha) {
    throw new Error(`ADMIN_SENHA inválida no backend/.env. ${erroSenha}`);
  }
  if (nome.length < 2 || nome.length > 100) {
    throw new Error('ADMIN_NOME deve ter entre 2 e 100 caracteres.');
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  // "Upsert": insere; se o e-mail já existir (ON CONFLICT), atualiza.
  const { rows } = await db.query(
    `INSERT INTO usuarios (nome, email, senha_hash, papel)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET nome = EXCLUDED.nome,
                   senha_hash = EXCLUDED.senha_hash,
                   papel = 'admin'
     RETURNING id`,
    [nome, email, senhaHash]
  );

  // Nunca imprimimos a senha.
  console.log(`Administrador pronto: ${email} (id ${rows[0].id}).`);
}

main()
  .catch((erro) => {
    console.error('Erro:', erro.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
