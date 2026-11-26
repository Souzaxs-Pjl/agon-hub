// =====================================================================
// Testes de UNIDADE dos validadores de modalidades e equipes.
// Não precisam de banco nem de servidor. Executar: npm test
// =====================================================================
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseId, validarModalidade, validarEquipe, validarAtleta, validarNoticia } = require('../src/validacao');

const equipeValida = {
  nome: 'Falcões do Norte',
  sigla: 'fdn',
  tipo: 'ficticia',
  modalidade_id: 2,
};

describe('parseId', () => {
  it('aceita número inteiro positivo, em texto ou número', () => {
    assert.equal(parseId('12'), 12);
    assert.equal(parseId(7), 7);
  });

  it('recusa valores que não são id', () => {
    for (const valor of ['abc', '-1', '1.5', '0', '', undefined, null, '12a']) {
      assert.equal(parseId(valor), null, `esperava null para ${valor}`);
    }
  });
});

describe('validarEquipe', () => {
  it('aceita uma equipe válida e deixa a sigla em maiúsculas', () => {
    const { erros, dados } = validarEquipe(equipeValida);
    assert.deepEqual(erros, []);
    assert.equal(dados.sigla, 'FDN');
    assert.equal(dados.modalidade_id, 2);
    assert.equal(dados.instituicao, null);
    assert.equal(dados.logo_url, null);
  });

  it('trata campos opcionais vazios como null', () => {
    const { erros, dados } = validarEquipe({ ...equipeValida, logo_url: '  ', descricao: '' });
    assert.deepEqual(erros, []);
    assert.equal(dados.logo_url, null);
    assert.equal(dados.descricao, null);
  });

  it('aceita logo com http ou https', () => {
    assert.deepEqual(validarEquipe({ ...equipeValida, logo_url: 'https://exemplo.com/logo.png' }).erros, []);
  });

  it('recusa logo que não é http/https', () => {
    const { erros } = validarEquipe({ ...equipeValida, logo_url: 'ftp://exemplo.com/x.png' });
    assert.equal(erros.length, 1);
  });

  it('recusa tipo fora da lista', () => {
    assert.equal(validarEquipe({ ...equipeValida, tipo: 'profissional' }).erros.length, 1);
  });

  it('recusa sigla com espaço ou longa demais', () => {
    assert.equal(validarEquipe({ ...equipeValida, sigla: 'F D' }).erros.length, 1);
    assert.equal(validarEquipe({ ...equipeValida, sigla: 'ABCDEFGHIJK' }).erros.length, 1);
  });

  it('recusa modalidade_id que não é um id', () => {
    assert.equal(validarEquipe({ ...equipeValida, modalidade_id: 'futsal' }).erros.length, 1);
  });

  it('recusa descrição longa demais e instituição que não é texto', () => {
    const { erros } = validarEquipe({
      ...equipeValida,
      descricao: 'x'.repeat(1001),
      instituicao: 123,
    });
    assert.equal(erros.length, 2);
  });

  it('acumula todos os erros de uma vez, sem quebrar com corpo vazio', () => {
    assert.ok(validarEquipe({}).erros.length >= 4);
    assert.ok(validarEquipe(undefined).erros.length >= 4);
  });
});

describe('validarModalidade', () => {
  it('aceita esporte e esport', () => {
    assert.deepEqual(validarModalidade({ nome: 'Futsal', tipo: 'esporte' }).erros, []);
    assert.deepEqual(validarModalidade({ nome: 'Valorant', tipo: 'esport' }).erros, []);
  });

  it('recusa tipo diferente de esporte/esport', () => {
    assert.equal(validarModalidade({ nome: 'Futsal', tipo: 'jogo' }).erros.length, 1);
  });

  it('recusa nome curto', () => {
    assert.equal(validarModalidade({ nome: 'A', tipo: 'esporte' }).erros.length, 1);
  });
});
\n\ndescribe('URLs de imagem sem limite de caracteres', () => {
  const urlLonga = 'https://cdn.exemplo.com/imagens/' + 'x'.repeat(800) + '.webp?token=' + 't'.repeat(600);

  it('aceita URL longa de logo de equipe', () => {
    const { erros, dados } = validarEquipe({ ...equipeValida, logo_url: urlLonga });
    assert.deepEqual(erros, []);
    assert.equal(dados.logo_url, urlLonga);
  });

  it('aceita URL longa de foto de atleta', () => {
    const { erros, dados } = validarAtleta({ nome: 'Atleta Teste', foto_url: urlLonga });
    assert.deepEqual(erros, []);
    assert.equal(dados.foto_url, urlLonga);
  });

  it('aceita URL longa de imagem de notícia', () => {
    const { erros, dados } = validarNoticia({ titulo: 'Notícia teste', conteudo: 'Conteúdo', imagem_url: urlLonga });
    assert.deepEqual(erros, []);
    assert.equal(dados.imagem_url, urlLonga);
  });
});
