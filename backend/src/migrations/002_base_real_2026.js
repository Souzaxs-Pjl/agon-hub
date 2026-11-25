// Migração idempotente da base demonstrativa do AGON Hub.
// Adiciona os cadastros reais sem apagar contas, publicações ou registros existentes.
const fs = require('fs');
const path = require('path');

module.exports = async function aplicarBaseDemonstrativa(db) {
  const raiz = path.resolve(__dirname, '..', '..', '..');
  const arquivoDados = path.join(raiz, 'database', 'data', 'agon_demo_data_2026.json');
  const dados = JSON.parse(fs.readFileSync(arquivoDados, 'utf8'));

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query([
      'CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW());',
      'ALTER TABLE equipes ADD COLUMN IF NOT EXISTS codigo_fonte VARCHAR(30), ADD COLUMN IF NOT EXISTS sigla_oficial VARCHAR(10), ADD COLUMN IF NOT EXISTS slogan VARCHAR(180), ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255), ADD COLUMN IF NOT EXISTS titulos TEXT, ADD COLUMN IF NOT EXISTS cidade VARCHAR(100), ADD COLUMN IF NOT EXISTS responsavel VARCHAR(150), ADD COLUMN IF NOT EXISTS cores VARCHAR(180), ADD COLUMN IF NOT EXISTS demonstrativo BOOLEAN NOT NULL DEFAULT FALSE;',
      'ALTER TABLE atletas ADD COLUMN IF NOT EXISTS codigo_fonte VARCHAR(30), ADD COLUMN IF NOT EXISTS geracao VARCHAR(30), ADD COLUMN IF NOT EXISTS divisao VARCHAR(30), ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255), ADD COLUMN IF NOT EXISTS titulos TEXT, ADD COLUMN IF NOT EXISTS revisao_cadastro BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN IF NOT EXISTS demonstrativo BOOLEAN NOT NULL DEFAULT FALSE, ADD COLUMN IF NOT EXISTS perfil_publico BOOLEAN NOT NULL DEFAULT FALSE;',
      'ALTER TABLE campeonatos ADD COLUMN IF NOT EXISTS demonstrativo BOOLEAN NOT NULL DEFAULT FALSE;',
      'ALTER TABLE noticias ADD COLUMN IF NOT EXISTS demonstrativo BOOLEAN NOT NULL DEFAULT FALSE;',
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_equipes_codigo_fonte ON equipes(codigo_fonte);',
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_atletas_codigo_fonte ON atletas(codigo_fonte);'
    ].join('\n'));

    const aplicada = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['002_demo_base_2026']);
    if (aplicada.rowCount) {
      await client.query('COMMIT');
      return { aplicada: false, equipes: 0, atletas: 0 };
    }

    // A versão demonstrativa não expõe os registros de atletas da base original.
    // O cadastro das equipes permanece intacto.
    await client.query(
      "UPDATE atletas SET demonstrativo = TRUE, perfil_publico = FALSE WHERE codigo_fonte IS NOT NULL AND codigo_fonte NOT LIKE 'DEMO-%'"
    );

    await client.query(
      'UPDATE equipes SET demonstrativo = TRUE WHERE nome = ANY($1::text[])',
      [['Falcões do Norte','Tigres Azuis','Lobos de Aço','Atlética Exemplo','Nova Alvorada Esports','Pulso Neon','Cobra Carmesim','Vórtice Digital']]
    );
    await client.query(
      'UPDATE atletas SET demonstrativo = TRUE WHERE id BETWEEN 1 AND 12 AND nome = ANY($1::text[])',
      [['Maria Souza','Bruno Teles','Carla Mendes','Diego Rocha','Eduardo Lima','Fernanda Alves','Gabriel Nunes','Helena Prado','Igor Martins','Júlia Ramos','Kauê Ferraz','Larissa Dias']]
    );
    await client.query(
      "UPDATE campeonatos SET demonstrativo = TRUE WHERE (nome = 'Copa AGON de Futsal' AND edicao IN (2025, 2026)) OR (nome = 'Liga AGON Valorant' AND edicao = 2027)"
    );
    await client.query(
      'UPDATE noticias SET demonstrativo = TRUE WHERE titulo = ANY($1::text[])',
      [['Bem-vindo ao AGON Hub','Copa AGON de Futsal 2026 começa com quatro equipes','Liga AGON Valorant 2027 já tem equipes definidas','Equipes reais e fictícias convivem no Universo AGON']]
    );
    await client.query(
      'UPDATE partidas SET demonstrativo = TRUE WHERE campeonato_id IN (SELECT id FROM campeonatos WHERE demonstrativo = TRUE)'
    );

    await client.query(
      "INSERT INTO modalidades (nome, tipo, descricao) VALUES ('Multimodal', 'esporte', 'Cadastro institucional de equipes que participam de diferentes modalidades; a modalidade específica é definida na inscrição do campeonato.') ON CONFLICT (nome) DO NOTHING"
    );
    const modalidade = await client.query("SELECT id FROM modalidades WHERE nome = 'Multimodal' LIMIT 1");
    if (!modalidade.rowCount) throw new Error('Não foi possível localizar a modalidade Multimodal.');
    const modalidadeId = modalidade.rows[0].id;

    let equipesInseridas = 0;
    for (let i = 0; i < dados.teams.length; i++) {
      const equipe = dados.teams[i];
      const siglaTecnica = equipe.sigla || ('EQ' + String(i - 5).padStart(3, '0'));
      const sql = [
        'INSERT INTO equipes (codigo_fonte, sigla_oficial, nome, sigla, tipo, instituicao, descricao, modalidade_id, cidade, responsavel, cores, demonstrativo)',
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,FALSE)',
        'ON CONFLICT (nome) DO UPDATE SET codigo_fonte = COALESCE(equipes.codigo_fonte, EXCLUDED.codigo_fonte), sigla_oficial = COALESCE(equipes.sigla_oficial, EXCLUDED.sigla_oficial)',
        'RETURNING id'
      ].join(' ');
      const resultado = await client.query(sql, [
        equipe.source_code, equipe.sigla, equipe.name, siglaTecnica, equipe.kind,
        equipe.institution, equipe.description, modalidadeId, equipe.city,
        equipe.responsible, equipe.colors
      ]);
      if (resultado.rowCount) equipesInseridas++;
    }

    let atletasInseridos = 0;
    const sqlAtleta = [
      'INSERT INTO atletas (codigo_fonte, nome, apelido, bio, geracao, divisao, revisao_cadastro, demonstrativo, perfil_publico)',
      'VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE,TRUE)',
      'ON CONFLICT (codigo_fonte) DO NOTHING RETURNING id'
    ].join(' ');
    for (const atleta of dados.roster) {
      const resultado = await client.query(sqlAtleta, [
        atleta.source_id, atleta.name, atleta.nickname,
        `Perfil fictício criado exclusivamente para demonstração do AGON Hub. Integra a equipe ${atleta.team_name}.`,
        atleta.generation, atleta.division, Boolean(atleta.needs_review)
      ]);
      if (resultado.rowCount) atletasInseridos++;
    }

    await client.query(
      [
        "INSERT INTO equipe_atletas (equipe_id, atleta_id, funcao)",
        "SELECT e.id, a.id, 'Atleta de demonstração'",
        'FROM jsonb_to_recordset($1::jsonb) AS r(source_id text, team_name text)',
        'JOIN atletas a ON a.codigo_fonte = r.source_id',
        'JOIN equipes e ON e.nome = r.team_name',
        'ON CONFLICT (equipe_id, atleta_id) DO NOTHING'
      ].join(' '),
      [JSON.stringify(dados.roster.map(a => ({ source_id: a.source_id, team_name: a.team_name })))]
    );

    await client.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['002_demo_base_2026']);
    await client.query('COMMIT');
    return { aplicada: true, equipes: equipesInseridas, atletas: atletasInseridos, elencos: dados.roster.length };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
