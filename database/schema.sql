-- =====================================================================
-- AGON Hub - schema.sql
-- Cria a estrutura (tabelas) do banco de dados PostgreSQL.
--
-- COMO USAR (com o banco "agon_hub" já criado):
--   psql -U postgres -d agon_hub -f database/schema.sql
--
-- ATENÇÃO: este script não apaga dados.
-- Cria tabelas ausentes e acrescenta os campos de perfil ausentes em usuarios.
-- Outras mudanças estruturais futuras devem usar migrações SQL específicas.
-- Execute seed.sql uma única vez em cada banco novo.
-- =====================================================================

-- 2) USUARIOS
--    Quem tem conta na plataforma (login).
--    O campo "papel" define a permissão: 'admin' ou 'usuario'.
--    O cadastro público sempre grava 'usuario' (regra aplicada no backend).
--    A senha NUNCA é guardada em texto puro: só o hash gerado pelo bcrypt.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL        PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)  NOT NULL,
    papel       VARCHAR(10)   NOT NULL DEFAULT 'usuario'
                CHECK (papel IN ('admin', 'usuario')),
    criado_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Campos do perfil pessoal. IF NOT EXISTS também atualiza bancos já criados.
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS perfil_publico BOOLEAN NOT NULL DEFAULT TRUE;


-- ---------------------------------------------------------------------
-- 3) MODALIDADES
--    Esportes tradicionais e jogos eletrônicos na mesma tabela.
--    "tipo" diferencia: 'esporte' (ex.: Futsal) ou 'esport' (ex.: Valorant).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modalidades (
    id         SERIAL       PRIMARY KEY,
    nome       VARCHAR(80)  NOT NULL UNIQUE,
    tipo       VARCHAR(10)  NOT NULL
               CHECK (tipo IN ('esporte', 'esport')),
    descricao  TEXT
);

-- ---------------------------------------------------------------------
-- 4) EQUIPES
--    Relação 1:N com modalidades (uma modalidade tem várias equipes;
--    cada equipe tem uma modalidade principal).
--    "tipo" distingue equipes reais de fictícias.
--    "logo_url" guarda o caminho do arquivo enviado por upload.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipes (
    id             SERIAL        PRIMARY KEY,
    nome           VARCHAR(100)  NOT NULL UNIQUE,
    sigla          VARCHAR(10)   NOT NULL UNIQUE,
    tipo           VARCHAR(10)   NOT NULL
                   CHECK (tipo IN ('real', 'ficticia')),
    instituicao    VARCHAR(150),
    descricao      TEXT,
    logo_url       VARCHAR(255),
    modalidade_id  INTEGER       NOT NULL
                   REFERENCES modalidades (id) ON DELETE RESTRICT,
    criado_em      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5) ATLETAS
--    Representa a PESSOA. Nem todo atleta tem conta na plataforma,
--    por isso "usuario_id" é opcional (pode ser NULL).
--    UNIQUE garante que um usuário esteja ligado a no máximo um atleta.
--    "foto_url" guarda o caminho do arquivo enviado por upload.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS atletas (
    id          SERIAL        PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    apelido     VARCHAR(50),
    bio         TEXT,
    foto_url    VARCHAR(255),
    usuario_id  INTEGER       UNIQUE
                REFERENCES usuarios (id) ON DELETE SET NULL,
    criado_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6) EQUIPE_ATLETAS  (relação N:N entre equipes e atletas)
--    Uma equipe tem vários atletas e um atleta pode estar em várias equipes.
--    A chave primária composta impede o mesmo atleta duas vezes na mesma equipe.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipe_atletas (
    equipe_id  INTEGER      NOT NULL
               REFERENCES equipes (id) ON DELETE CASCADE,
    atleta_id  INTEGER      NOT NULL
               REFERENCES atletas (id) ON DELETE CASCADE,
    funcao     VARCHAR(50),
    PRIMARY KEY (equipe_id, atleta_id)
);

-- ---------------------------------------------------------------------
-- 7) CAMPEONATOS
--    Cada linha é uma EDIÇÃO de um campeonato (ex.: "Copa AGON" 2026).
--    Relação 1:N com modalidades.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campeonatos (
    id             SERIAL        PRIMARY KEY,
    nome           VARCHAR(120)  NOT NULL,
    edicao         INTEGER       NOT NULL,
    modalidade_id  INTEGER       NOT NULL
                   REFERENCES modalidades (id) ON DELETE RESTRICT,
    data_inicio    DATE,
    data_fim       DATE,
    status         VARCHAR(15)   NOT NULL DEFAULT 'planejado'
                   CHECK (status IN ('planejado', 'em_andamento', 'encerrado')),
    descricao      TEXT,
    UNIQUE (nome, edicao),
    CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio)
);

-- ---------------------------------------------------------------------
-- 8) CAMPEONATO_EQUIPES  (relação N:N entre campeonatos e equipes)
--    Define quais equipes participam de cada campeonato.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campeonato_equipes (
    campeonato_id  INTEGER  NOT NULL
                   REFERENCES campeonatos (id) ON DELETE CASCADE,
    equipe_id      INTEGER  NOT NULL
                   REFERENCES equipes (id) ON DELETE CASCADE,
    PRIMARY KEY (campeonato_id, equipe_id)
);

-- ---------------------------------------------------------------------
-- 9) PARTIDAS
--    Relação 1:N com campeonatos. Cada partida tem duas equipes.
--    "fase" é um texto livre (ex.: 'Fase de grupos', 'Semifinal', 'Final').
--    Placar fica NULL enquanto a partida não aconteceu.
--    "demonstrativo" = TRUE marca resultados fictícios de exemplo,
--    para não confundi-los com resultados oficiais.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
    id                   SERIAL       PRIMARY KEY,
    campeonato_id        INTEGER      NOT NULL
                         REFERENCES campeonatos (id) ON DELETE CASCADE,
    equipe_casa_id       INTEGER      NOT NULL
                         REFERENCES equipes (id) ON DELETE RESTRICT,
    equipe_visitante_id  INTEGER      NOT NULL
                         REFERENCES equipes (id) ON DELETE RESTRICT,
    data_hora            TIMESTAMP,
    fase                 VARCHAR(50),
    placar_casa          INTEGER      CHECK (placar_casa >= 0),
    placar_visitante     INTEGER      CHECK (placar_visitante >= 0),
    status               VARCHAR(15)  NOT NULL DEFAULT 'agendada'
                         CHECK (status IN ('agendada', 'em_andamento', 'finalizada')),
    demonstrativo        BOOLEAN      NOT NULL DEFAULT FALSE,
    CHECK (equipe_casa_id <> equipe_visitante_id)
);

-- ---------------------------------------------------------------------
-- 10) NOTICIAS
--     Relação 1:N com usuarios (um usuário/admin escreve várias notícias).
--     Se o autor for apagado, a notícia continua (autor_id vira NULL).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
    id            SERIAL        PRIMARY KEY,
    titulo        VARCHAR(200)  NOT NULL,
    resumo        VARCHAR(300),
    conteudo      TEXT          NOT NULL,
    imagem_url    VARCHAR(255),
    autor_id      INTEGER
                  REFERENCES usuarios (id) ON DELETE SET NULL,
    publicado_em  TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------
-- 11) PUBLICACOES, CURTIDAS E COMENTARIOS (Comunidade)
-- Conteúdo criado por usuários autenticados; relações são removidas junto
-- com a publicação, conta, atleta ou equipe correspondente.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publicacoes (
    id               SERIAL       PRIMARY KEY,
    autor_usuario_id INTEGER      NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    tipo_autor       VARCHAR(10)  NOT NULL CHECK (tipo_autor IN ('usuario', 'atleta', 'equipe')),
    atleta_id        INTEGER      REFERENCES atletas (id) ON DELETE CASCADE,
    equipe_id        INTEGER      REFERENCES equipes (id) ON DELETE CASCADE,
    texto            VARCHAR(2000) NOT NULL CHECK (char_length(trim(texto)) BETWEEN 1 AND 2000),
    criado_em        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CHECK (
      (tipo_autor = 'usuario' AND atleta_id IS NULL AND equipe_id IS NULL) OR
      (tipo_autor = 'atleta' AND atleta_id IS NOT NULL AND equipe_id IS NULL) OR
      (tipo_autor = 'equipe' AND equipe_id IS NOT NULL AND atleta_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS publicacao_curtidas (
    publicacao_id INTEGER NOT NULL REFERENCES publicacoes (id) ON DELETE CASCADE,
    usuario_id    INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    criado_em     TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publicacao_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS publicacao_comentarios (
    id            SERIAL        PRIMARY KEY,
    publicacao_id INTEGER       NOT NULL REFERENCES publicacoes (id) ON DELETE CASCADE,
    usuario_id    INTEGER       NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    texto         VARCHAR(1000) NOT NULL CHECK (char_length(trim(texto)) BETWEEN 1 AND 1000),
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publicacoes_criado_em ON publicacoes (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_publicacao_comentarios_publicacao_data ON publicacao_comentarios (publicacao_id, criado_em);
