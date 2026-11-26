const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { tratarErros } = require('../src/middlewares/erros');

function criarResposta() {
  return {
    statusCode: null,
    corpo: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(dados) {
      this.corpo = dados;
      return this;
    },
  };
}

describe('tratamento de conflitos de integridade', () => {
  it('converte violação RESTRICT do PostgreSQL em 409 ao excluir', () => {
    const req = { method: 'DELETE' };
    const res = criarResposta();

    tratarErros({ code: '23001' }, req, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.match(res.corpo.erro, /partidas ou outros vínculos/);
  });

  it('não expõe erro interno para exclusão bloqueada por chave estrangeira', () => {
    const req = { method: 'DELETE' };
    const res = criarResposta();

    tratarErros({ code: '23503' }, req, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.match(res.corpo.erro, /registro está em uso/);
  });
});
