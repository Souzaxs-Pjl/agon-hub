// Migração idempotente das tabelas da Comunidade AGON.
module.exports = async function aplicarSchemaComunidade(db) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS publicacoes (
        id SERIAL PRIMARY KEY,
        autor_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo_autor VARCHAR(10) NOT NULL CHECK (tipo_autor IN ('usuario','atleta','equipe')),
        atleta_id INTEGER REFERENCES atletas(id) ON DELETE CASCADE,
        equipe_id INTEGER REFERENCES equipes(id) ON DELETE CASCADE,
        texto VARCHAR(2000) NOT NULL CHECK (char_length(trim(texto)) BETWEEN 1 AND 2000),
        criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
        CHECK (
          (tipo_autor = 'usuario' AND atleta_id IS NULL AND equipe_id IS NULL) OR
          (tipo_autor = 'atleta' AND atleta_id IS NOT NULL AND equipe_id IS NULL) OR
          (tipo_autor = 'equipe' AND equipe_id IS NOT NULL AND atleta_id IS NULL)
        )
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS publicacao_curtidas (
        publicacao_id INTEGER NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (publicacao_id, usuario_id)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS publicacao_comentarios (
        id SERIAL PRIMARY KEY,
        publicacao_id INTEGER NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        texto VARCHAR(1000) NOT NULL CHECK (char_length(trim(texto)) BETWEEN 1 AND 1000),
        criado_em TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_publicacoes_criado_em ON publicacoes(criado_em DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_publicacao_comentarios_publicacao_data ON publicacao_comentarios(publicacao_id, criado_em)');
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['004_schema_comunidade']);
    await client.query('COMMIT');
    return { aplicada: true };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
