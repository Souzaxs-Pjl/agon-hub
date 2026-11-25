-- AGON Hub - Comunidade (migração 001)
-- Execute uma vez no PostgreSQL existente. Não apaga dados.
CREATE TABLE IF NOT EXISTS publicacoes (
  id SERIAL PRIMARY KEY,
  autor_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_autor VARCHAR(10) NOT NULL DEFAULT 'usuario'
    CHECK (tipo_autor IN ('usuario','atleta','equipe')),
  atleta_id INTEGER REFERENCES atletas(id) ON DELETE SET NULL,
  equipe_id INTEGER REFERENCES equipes(id) ON DELETE SET NULL,
  texto TEXT NOT NULL CHECK (length(trim(texto)) BETWEEN 1 AND 2000),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (
    (tipo_autor = 'usuario' AND atleta_id IS NULL AND equipe_id IS NULL) OR
    (tipo_autor = 'atleta' AND atleta_id IS NOT NULL AND equipe_id IS NULL) OR
    (tipo_autor = 'equipe' AND equipe_id IS NOT NULL AND atleta_id IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_publicacoes_criado ON publicacoes(criado_em DESC);
CREATE TABLE IF NOT EXISTS publicacao_curtidas (
  publicacao_id INTEGER NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (publicacao_id, usuario_id)
);
CREATE TABLE IF NOT EXISTS publicacao_comentarios (
  id SERIAL PRIMARY KEY,
  publicacao_id INTEGER NOT NULL REFERENCES publicacoes(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto VARCHAR(1000) NOT NULL CHECK (length(trim(texto)) BETWEEN 1 AND 1000),
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comentarios_publicacao ON publicacao_comentarios(publicacao_id, criado_em);
