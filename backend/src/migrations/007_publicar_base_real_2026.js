// Migração idempotente: publica a base esportiva real já autorizada para o AGON Hub.
// Preserva os registros existentes, oculta elencos fictícios de demonstração
// e mantém perfis marcados para revisão fora da consulta pública.
const fs = require('node:fs');
const path = require('node:path');

module.exports = async function publicarBaseReal(db) {
  const raiz = path.resolve(__dirname, '..', '..', '..');
  const arquivo = path.join(raiz, 'database', 'data', 'agon_real_data_2026.json');
  const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));

  if (!Array.isArray(dados.teams) || !Array.isArray(dados.roster)) {
    throw new Error('A base real AGON precisa conter as listas teams e roster.');
  }

  const codigosEquipes = [...new Set(dados.teams.map((e) => e.source_code).filter(Boolean))];
  const codigosAtletas = [...new Set(dados.roster.map((a) => a.source_id).filter(Boolean))];
  if (codigosEquipes.length !== dados.teams.length || codigosAtletas.length !== dados.roster.length) {
    throw new Error('A base real AGON possui códigos de origem ausentes ou duplicados.');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW())'
    );

    const versao = '007_publicar_base_real_2026';
    const aplicada = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
    if (aplicada.rowCount) {
      await client.query('COMMIT');
      return { aplicada: false, equipes: 0, atletas: 0, perfisPublicos: 0, demonstrativosOcultos: 0 };
    }

    const equipes = await client.query(
      'UPDATE equipes SET demonstrativo = FALSE WHERE codigo_fonte = ANY($1::text[]) RETURNING id',
      [codigosEquipes]
    );
    if (equipes.rowCount !== dados.teams.length) {
      throw new Error(
        `Base real incompleta: esperadas ${dados.teams.length} equipes identificadas, encontradas ${equipes.rowCount}.`
      );
    }

    for (const atleta of dados.roster) {
      await client.query(
        `INSERT INTO atletas
           (codigo_fonte, nome, apelido, geracao, divisao, revisao_cadastro, demonstrativo, perfil_publico)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)
         ON CONFLICT (codigo_fonte) DO UPDATE
           SET demonstrativo = FALSE,
               revisao_cadastro = EXCLUDED.revisao_cadastro,
               perfil_publico = EXCLUDED.perfil_publico`,
        [
          atleta.source_id,
          atleta.name,
          atleta.nickname || null,
          atleta.generation || null,
          atleta.division || null,
          Boolean(atleta.needs_review),
          !Boolean(atleta.needs_review),
        ]
      );
    }

    await client.query(
      `INSERT INTO equipe_atletas (equipe_id, atleta_id)
       SELECT e.id, a.id
       FROM jsonb_to_recordset($1::jsonb) AS r(source_id text, team_name text)
       JOIN atletas a ON a.codigo_fonte = r.source_id
       JOIN equipes e ON e.nome = r.team_name
       ON CONFLICT (equipe_id, atleta_id) DO NOTHING`,
      [JSON.stringify(dados.roster.map((a) => ({ source_id: a.source_id, team_name: a.team_name })))]
    );

    const vinculos = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM jsonb_to_recordset($1::jsonb) AS r(source_id text, team_name text)
       JOIN atletas a ON a.codigo_fonte = r.source_id
       JOIN equipes e ON e.nome = r.team_name
       JOIN equipe_atletas ea ON ea.atleta_id = a.id AND ea.equipe_id = e.id`,
      [JSON.stringify(dados.roster.map((a) => ({ source_id: a.source_id, team_name: a.team_name })))]
    );
    if (vinculos.rows[0].total !== dados.roster.length) {
      throw new Error(
        `Base real incompleta: esperados ${dados.roster.length} vínculos atleta-equipe, encontrados ${vinculos.rows[0].total}.`
      );
    }

    const demonstrativos = await client.query(
      `UPDATE atletas
       SET demonstrativo = TRUE, perfil_publico = FALSE
       WHERE codigo_fonte LIKE 'DEMO-%'`
    );

    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versao]);
    await client.query('COMMIT');

    return {
      aplicada: true,
      equipes: equipes.rowCount,
      atletas: dados.roster.length,
      perfisPublicos: dados.roster.filter((a) => !a.needs_review).length,
      demonstrativosOcultos: demonstrativos.rowCount,
    };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
