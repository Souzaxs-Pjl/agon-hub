// Migração idempotente do conteúdo esportivo demonstrativo da main.
const fs = require('fs');
const path = require('path');

module.exports = async function aplicarConteudoDemonstrativo(db) {
  const raiz = path.resolve(__dirname, '..', '..', '..');
  const arquivo = path.join(raiz, 'database', 'data', 'agon_demo_data_2026.json');
  const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW())');
    const jaAplicada = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['003_conteudo_demo_2026']);
    if (jaAplicada.rowCount) {
      await client.query('COMMIT');
      return { aplicada: false, atletas: 0, campeonatos: 0, partidas: 0, noticias: 0 };
    }

    // Importa os elencos ampliados sem duplicar os 318 registros já inseridos pela migração 002.
    const insertAtleta = `
      INSERT INTO atletas
        (codigo_fonte, nome, apelido, bio, geracao, divisao, revisao_cadastro, demonstrativo, perfil_publico)
      VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE,TRUE)
      ON CONFLICT (codigo_fonte) DO NOTHING
      RETURNING id
    `;
    let atletasNovos = 0;
    for (const atleta of dados.roster) {
      const r = await client.query(insertAtleta, [
        atleta.source_id, atleta.name, atleta.nickname || null,
        `Perfil fictício de demonstração do AGON Hub. Integra a equipe ${atleta.team_name}.`,
        atleta.generation || 'Geração demonstrativa', atleta.division || null, Boolean(atleta.needs_review)
      ]);
      if (r.rowCount) atletasNovos++;
    }

    await client.query(`
      INSERT INTO equipe_atletas (equipe_id, atleta_id, funcao)
      SELECT e.id, a.id, 'Atleta de demonstração'
      FROM jsonb_to_recordset($1::jsonb) AS r(source_id text, team_name text)
      JOIN atletas a ON a.codigo_fonte = r.source_id
      JOIN equipes e ON e.nome = r.team_name
      ON CONFLICT (equipe_id, atleta_id) DO NOTHING
    `, [JSON.stringify(dados.roster.map(a => ({ source_id: a.source_id, team_name: a.team_name })))]);

    const multimodal = await client.query("SELECT id FROM modalidades WHERE nome = 'Multimodal' LIMIT 1");
    const freeFire = await client.query("SELECT id FROM modalidades WHERE nome = 'Free Fire' LIMIT 1");
    if (!multimodal.rowCount || !freeFire.rowCount) throw new Error('Modalidades necessárias para o conteúdo demonstrativo não foram encontradas.');

    async function obterCampeonato(nome, edicao, modalidadeId, inicio, fim, status, descricao) {
      const r = await client.query(`
        INSERT INTO campeonatos
          (nome, edicao, modalidade_id, data_inicio, data_fim, status, descricao, demonstrativo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
        ON CONFLICT (nome, edicao) DO UPDATE
          SET descricao = EXCLUDED.descricao, demonstrativo = TRUE
        RETURNING id
      `, [nome, edicao, modalidadeId, inicio, fim, status, descricao]);
      return r.rows[0].id;
    }

    const nacionalId = await obterCampeonato(
      'Campeonato Nacional AGON', 2026, multimodal.rows[0].id,
      '2026-11-20', '2026-12-20', 'em_andamento',
      'Competição fictícia de demonstração com as equipes cadastradas no universo AGON.'
    );
    const copaId = await obterCampeonato(
      'Copa Universitária AGON', 2026, multimodal.rows[0].id,
      '2026-11-22', '2026-12-18', 'em_andamento',
      'Copa demonstrativa entre equipes universitárias e atléticas.'
    );
    const esportsId = await obterCampeonato(
      'AGON Esports League', 2026, freeFire.rows[0].id,
      '2026-12-01', '2026-12-22', 'planejado',
      'Liga fictícia de e-sports. Equipes multimodais participam da modalidade Free Fire nesta edição demonstrativa.'
    );

    const campeonatos = [
      { id: nacionalId, limit: 81, offset: 0 },
      { id: copaId, limit: 16, offset: 0 },
      { id: esportsId, limit: 8, offset: 16 }
    ];
    const equipesPorCampeonato = new Map();
    for (const campeonato of campeonatos) {
      const equipes = await client.query(
        'SELECT id FROM equipes WHERE demonstrativo = FALSE ORDER BY nome, id OFFSET $1 LIMIT $2',
        [campeonato.offset, campeonato.limit]
      );
      equipesPorCampeonato.set(campeonato.id, equipes.rows.map(r => r.id));
      for (const equipe of equipes.rows) {
        await client.query(
          'INSERT INTO campeonato_equipes (campeonato_id, equipe_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [campeonato.id, equipe.id]
        );
      }
    }

    let partidasNovas = 0;
    async function gerarFaseDeGrupos(campeonatoId, idsEquipes, tamanhoGrupo) {
      const grupos = [];
      for (let i = 0; i < idsEquipes.length; i += tamanhoGrupo) grupos.push(idsEquipes.slice(i, i + tamanhoGrupo));
      let numero = 0;
      for (let g = 0; g < grupos.length; g++) {
        const grupo = grupos[g];
        for (let a = 0; a < grupo.length; a++) {
          for (let b = a + 1; b < grupo.length; b++) {
            numero++;
            const casa = grupo[a], visitante = grupo[b];
            const data = new Date(Date.UTC(2026, 10, 20 + numero - 1, 19, 0, 0)).toISOString().slice(0, 19).replace('T', ' ');
            const finalizada = numero <= 5;
            let placarCasa = finalizada ? (numero * 2 + 1) % 5 : null;
            let placarVisitante = finalizada ? (numero * 3 + 2) % 5 : null;
            if (finalizada && placarCasa === placarVisitante) placarVisitante = (placarVisitante + 1) % 5;
            const r = await client.query(`
              INSERT INTO partidas
                (campeonato_id,equipe_casa_id,equipe_visitante_id,data_hora,fase,placar_casa,placar_visitante,status,demonstrativo)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
              ON CONFLICT DO NOTHING RETURNING id
            `, [campeonatoId,casa,visitante,data,`Fase de grupos — Grupo ${g + 1}`,placarCasa,placarVisitante,finalizada ? 'finalizada' : 'agendada']);
            if (r.rowCount) partidasNovas++;
          }
        }
      }
    }

    await gerarFaseDeGrupos(nacionalId, equipesPorCampeonato.get(nacionalId) || [], 4);
    await gerarFaseDeGrupos(copaId, equipesPorCampeonato.get(copaId) || [], 4);
    await gerarFaseDeGrupos(esportsId, equipesPorCampeonato.get(esportsId) || [], 4);

    const equipesDestaque = await client.query('SELECT id,nome FROM equipes WHERE demonstrativo=FALSE ORDER BY nome LIMIT 6');
    const atletasDestaque = await client.query(`
      SELECT a.id,a.nome,e.nome AS equipe_nome
      FROM atletas a JOIN equipe_atletas ea ON ea.atleta_id=a.id JOIN equipes e ON e.id=ea.equipe_id
      WHERE a.demonstrativo=FALSE AND a.perfil_publico=TRUE AND e.demonstrativo=FALSE
      ORDER BY a.nome LIMIT 6
    `);
    const noticias = [
      ['Campeonato Nacional AGON 2026 reúne 81 equipes','A edição demonstrativa conecta equipes cadastradas em todo o país.','O Campeonato Nacional AGON 2026 reúne as equipes cadastradas na plataforma. Calendário, participantes e placares desta versão são fictícios e servem para demonstrar as funcionalidades do AGON Hub.'],
      ['Copa Universitária AGON abre nova edição','Equipes universitárias participam de uma competição demonstrativa.','A Copa Universitária AGON apresenta uma edição fictícia com fase de grupos, partidas agendadas e resultados de demonstração.'],
      ['AGON Esports League prepara a temporada','A liga demonstrativa apresenta partidas de Free Fire.','A AGON Esports League é uma competição fictícia de e-sports criada para mostrar o cadastro de modalidades, equipes, campeonatos e partidas.']
    ];
    for (const [titulo,resumo,conteudo] of noticias) {
      const r = await client.query(`
        INSERT INTO noticias (titulo,resumo,conteudo,autor_id,demonstrativo)
        SELECT $1,$2,$3,(SELECT id FROM usuarios ORDER BY id LIMIT 1),TRUE
        WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo=$1)
        RETURNING id
      `, [titulo,resumo,conteudo]);
    }
    for (const equipe of equipesDestaque.rows) {
      const titulo = `Equipe ${equipe.nome} entra em foco no universo AGON`;
      await client.query(`
        INSERT INTO noticias (titulo,resumo,conteudo,autor_id,demonstrativo)
        SELECT $1,$2,$3,(SELECT id FROM usuarios ORDER BY id LIMIT 1),TRUE
        WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo=$1)
      `, [titulo,`Conheça a equipe ${equipe.nome} no cadastro demonstrativo.`,`A equipe ${equipe.nome} aparece no conteúdo fictício do AGON Hub. Os dados esportivos e resultados apresentados são demonstrativos e não representam notícias oficiais.`]);
    }
    for (const atleta of atletasDestaque.rows) {
      const titulo = `Perfil demonstrativo: ${atleta.nome}`;
      await client.query(`
        INSERT INTO noticias (titulo,resumo,conteudo,autor_id,demonstrativo)
        SELECT $1,$2,$3,(SELECT id FROM usuarios ORDER BY id LIMIT 1),TRUE
        WHERE NOT EXISTS (SELECT 1 FROM noticias WHERE titulo=$1)
      `, [titulo,`${atleta.nome} integra o elenco fictício de ${atleta.equipe_nome}.`,`Esta matéria é fictícia e foi criada para demonstrar a relação entre notícias, atletas e equipes no AGON Hub. ${atleta.nome} é um perfil demonstrativo associado à equipe ${atleta.equipe_nome}.`]);
    }

    await client.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['003_conteudo_demo_2026']);
    await client.query('COMMIT');
    return { aplicada: true, atletas: atletasNovos, campeonatos: 3, partidas: partidasNovas, noticias: noticias.length + equipesDestaque.rowCount + atletasDestaque.rowCount };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
