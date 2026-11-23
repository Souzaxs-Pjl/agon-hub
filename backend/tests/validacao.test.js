// =====================================================================
// Testes de UNIDADE das funções de validação.
// Não precisam de banco nem de servidor rodando.
//
// Executar: npm test   (dentro da pasta backend)
// Usa o executor de testes que já vem com o Node (node:test), então
// não é preciso instalar nada.
// =====================================================================
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizarEmail, validarSenha, validarCadastro } = require('../src/validacao');

describe('normalizarEmail', () => {
  it('remove espaços e deixa em minúsculas', () => {
    assert.equal(normalizarEmail('  Maria@Email.COM  '), 'maria@email.com');
  });

  it('devolve texto vazio quando não é texto', () => {
    assert.equal(normalizarEmail(undefined), '');
    assert.equal(normalizarEmail(123), '');
    assert.equal(normalizarEmail(null), '');
  });
});

describe('validarSenha', () => {
  it('aceita senha com 8 caracteres', () => {
    assert.equal(validarSenha('12345678'), null);
  });

  it('rejeita senha curta', () => {
    assert.match(validarSenha('1234567'), /mínimo 8/);
  });

  it('rejeita o que não é texto', () => {
    assert.ok(validarSenha(undefined));
    assert.ok(validarSenha(12345678));
  });

  it('rejeita senha com mais de 72 bytes (limite do bcrypt)', () => {
    assert.match(validarSenha('a'.repeat(73)), /longa demais/);
    // "ç" ocupa 2 bytes: 37 letras = 74 bytes, embora tenha só 37 caracteres
    assert.match(validarSenha('ç'.repeat(37)), /longa demais/);
  });

  it('aceita exatamente 72 bytes', () => {
    assert.equal(validarSenha('a'.repeat(72)), null);
  });
});

describe('validarCadastro', () => {
  it('aceita dados válidos e normaliza nome e e-mail', () => {
    const r = validarCadastro({ nome: '  Ana Lima ', email: 'ANA@Teste.com', senha: 'senhaboa1' });
    assert.deepEqual(r.erros, []);
    assert.equal(r.nome, 'Ana Lima');
    assert.equal(r.email, 'ana@teste.com');
  });

  it('acumula todos os erros de uma vez', () => {
    const r = validarCadastro({ nome: 'A', email: 'sem-arroba', senha: '123' });
    assert.equal(r.erros.length, 3);
  });

  it('rejeita corpo ausente ou inválido sem quebrar', () => {
    assert.equal(validarCadastro(undefined).erros.length, 3);
    assert.equal(validarCadastro(null).erros.length, 3);
    assert.equal(validarCadastro('texto').erros.length, 3);
  });

  it('rejeita e-mail com espaços no meio', () => {
    const r = validarCadastro({ nome: 'Ana', email: 'a na@teste.com', senha: 'senhaboa1' });
    assert.equal(r.erros.length, 1);
  });

  it('não devolve nem usa o campo "papel" enviado pelo cliente', () => {
    const r = validarCadastro({ nome: 'Ana', email: 'ana@teste.com', senha: 'senhaboa1', papel: 'admin' });
    assert.deepEqual(r.erros, []);
    assert.equal('papel' in r, false);
  });
});
