-- AGON Hub 2.0 - dados iniciais
-- Registros de demonstração não são resultados canônicos do Universo AGON.
-- Não cria contas administrativas com senhas públicas. Use npm run admin:create.

BEGIN;

INSERT INTO roles (code, name, description) VALUES
    ('user', 'Usuário', 'Conta padrão da plataforma.'),
    ('admin', 'Administrador', 'Administração global da plataforma.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO institutions (name, short_name, slug, institution_type, city, state, country, is_fictional, description) VALUES
    ('Universo AGON', 'AGON', 'universo-agon', 'ORGANIZATION', NULL, NULL, 'Brasil', TRUE, 'Organização fictícia do Universo AGON.'),
    ('Instituto Federal de São Paulo - Campus São Carlos', 'IFSP São Carlos', 'ifsp-sao-carlos', 'UNIVERSITY', 'São Carlos', 'SP', 'Brasil', FALSE, 'Instituição de referência para dados de demonstração.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO teams (name, short_name, slug, team_type, is_fictional, country) VALUES
    ('Turquia', 'TUR', 'turquia', 'AGON', TRUE, 'Brasil'),
    ('Rússia', 'RUS', 'russia', 'AGON', TRUE, 'Brasil'),
    ('Holanda', 'HOL', 'holanda', 'AGON', TRUE, 'Brasil'),
    ('França', 'FRA', 'franca', 'AGON', TRUE, 'Brasil'),
    ('Grota', 'GRO', 'grota', 'AGON', TRUE, 'Brasil'),
    ('Tropa dos Laranjas', 'N$', 'tropa-dos-laranjas', 'AGON', TRUE, 'Brasil')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sports (name, short_name, slug, sport_type, participant_type, description) VALUES
    ('Futebol', 'FUT', 'futebol', 'SPORT', 'TEAM', 'Modalidade esportiva coletiva.'),
    ('Free Fire', 'FF', 'free-fire', 'ESPORT', 'TEAM', 'Modalidade de esporte eletrônico.'),
    ('Honor of Kings', 'HOK', 'honor-of-kings', 'ESPORT', 'TEAM', 'Modalidade de esporte eletrônico.'),
    ('Clash Royale', 'CR', 'clash-royale', 'ESPORT', 'ATHLETE', 'Modalidade individual de esporte eletrônico.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO people (display_name, slug, person_type, nationality, biography) VALUES
    ('Atleta de Demonstração AGON', 'atleta-demonstracao-agon', 'FICTIONAL', 'Não informada', 'Pessoa fictícia usada apenas para validar a estrutura inicial.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO athletes (person_id, primary_sport_id, athlete_code, position, biography)
SELECT p.id, s.id, 'AGON-DEMO-001', 'Não definido', 'Cadastro técnico de demonstração.'
FROM people p CROSS JOIN sports s
WHERE p.slug = 'atleta-demonstracao-agon' AND s.slug = 'futebol'
  AND NOT EXISTS (SELECT 1 FROM athletes a WHERE a.athlete_code = 'AGON-DEMO-001');

INSERT INTO competitions (
    sport_id, organizer_institution_id, name, slug, season, description,
    competition_type, format, participant_type, status,
    start_date, end_date, points_win, points_draw, points_loss,
    is_fictional, is_demo
)
SELECT s.id, i.id, 'Liga de Demonstração AGON', 'liga-demonstracao-agon-2026', '2026',
       'Competição técnica de demonstração para validar participantes, partidas e classificação.',
       'LEAGUE', 'ROUND_ROBIN', 'TEAM', 'IN_PROGRESS',
       DATE '2026-11-01', DATE '2026-12-31', 3, 1, 0, TRUE, TRUE
FROM sports s CROSS JOIN institutions i
WHERE s.slug = 'futebol' AND i.slug = 'universo-agon'
  AND NOT EXISTS (SELECT 1 FROM competitions c WHERE c.slug = 'liga-demonstracao-agon-2026');

INSERT INTO competition_participants (competition_id, participant_type, team_id, status)
SELECT c.id, 'TEAM', t.id, 'ACTIVE'
FROM competitions c CROSS JOIN teams t
WHERE c.slug = 'liga-demonstracao-agon-2026'
  AND t.slug IN ('turquia', 'russia', 'holanda', 'franca', 'grota', 'tropa-dos-laranjas')
  AND NOT EXISTS (
      SELECT 1 FROM competition_participants cp
      WHERE cp.competition_id = c.id AND cp.team_id = t.id
  );

INSERT INTO matches (
    competition_id, home_participant_id, away_participant_id, match_code,
    round_name, match_number, scheduled_at, status, home_score, away_score,
    is_demo, completed_at
)
SELECT c.id, hcp.id, acp.id, 'DEMO-001', 'Rodada 1', 1,
       TIMESTAMPTZ '2026-11-05 19:00:00-03', 'COMPLETED', 2, 1, TRUE,
       TIMESTAMPTZ '2026-11-05 20:50:00-03'
FROM competitions c
JOIN teams ht ON ht.slug = 'turquia'
JOIN teams at ON at.slug = 'russia'
JOIN competition_participants hcp ON hcp.competition_id = c.id AND hcp.team_id = ht.id
JOIN competition_participants acp ON acp.competition_id = c.id AND acp.team_id = at.id
WHERE c.slug = 'liga-demonstracao-agon-2026'
ON CONFLICT (competition_id, match_code) DO NOTHING;

INSERT INTO matches (
    competition_id, home_participant_id, away_participant_id, match_code,
    round_name, match_number, scheduled_at, status, home_score, away_score,
    is_demo, completed_at
)
SELECT c.id, hcp.id, acp.id, 'DEMO-002', 'Rodada 1', 2,
       TIMESTAMPTZ '2026-11-06 19:00:00-03', 'COMPLETED', 0, 0, TRUE,
       TIMESTAMPTZ '2026-11-06 20:50:00-03'
FROM competitions c
JOIN teams ht ON ht.slug = 'holanda'
JOIN teams at ON at.slug = 'franca'
JOIN competition_participants hcp ON hcp.competition_id = c.id AND hcp.team_id = ht.id
JOIN competition_participants acp ON acp.competition_id = c.id AND acp.team_id = at.id
WHERE c.slug = 'liga-demonstracao-agon-2026'
ON CONFLICT (competition_id, match_code) DO NOTHING;

INSERT INTO matches (
    competition_id, home_participant_id, away_participant_id, match_code,
    round_name, match_number, scheduled_at, status, is_demo
)
SELECT c.id, hcp.id, acp.id, 'DEMO-003', 'Rodada 2', 1,
       TIMESTAMPTZ '2026-11-15 19:00:00-03', 'SCHEDULED', TRUE
FROM competitions c
JOIN teams ht ON ht.slug = 'grota'
JOIN teams at ON at.slug = 'tropa-dos-laranjas'
JOIN competition_participants hcp ON hcp.competition_id = c.id AND hcp.team_id = ht.id
JOIN competition_participants acp ON acp.competition_id = c.id AND acp.team_id = at.id
WHERE c.slug = 'liga-demonstracao-agon-2026'
ON CONFLICT (competition_id, match_code) DO NOTHING;

COMMIT;
