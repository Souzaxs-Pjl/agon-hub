// Ajuste idempotente do período do Campeonato Nacional demonstrativo.
module.exports = async function ajustarCalendarioDemo(db) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT NOW())');
    const jaAplicada = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', ['005_calendario_nacional_demo']);
    if (jaAplicada.rowCount) {
      await client.query('COMMIT');
      return { aplicada: false };
    }
    // A fase de grupos demonstrativa é distribuída ao longo do calendário
    // gerado para os participantes; estende a data final sem alterar resultados.
    await client.query(`
      UPDATE campeonatos
      SET data_fim = '2027-03-31'
      WHERE nome = 'Campeonato Nacional AGON'
        AND edicao = 2026
        AND demonstrativo = TRUE
    `);
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING', ['005_calendario_nacional_demo']);
    await client.query('COMMIT');
    return { aplicada: true };
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
};
