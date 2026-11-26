// Migração idempotente: URLs de imagem podem ser extensas (CDNs/query tokens).
module.exports = async function aplicarUrlsImagemSemLimite(db) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE equipes ALTER COLUMN logo_url TYPE TEXT');
    await client.query('ALTER TABLE atletas ALTER COLUMN foto_url TYPE TEXT');
    await client.query('ALTER TABLE noticias ALTER COLUMN imagem_url TYPE TEXT');
    await client.query(
      "INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING",
      ['006_urls_imagem_sem_limite']
    );
    await client.query('COMMIT');
    return { aplicada: true };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
