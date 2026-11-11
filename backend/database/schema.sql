-- AGON Hub 2.0
-- Banco enxuto: 10 tabelas + views derivadas.
-- Execute em um banco PostgreSQL NOVO chamado agon_hub.
-- Não execute sobre o schema legado de 39 tabelas.

BEGIN;

CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE people (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    display_name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    person_type VARCHAR(20) NOT NULL DEFAULT 'REAL',
    birth_date DATE,
    nationality VARCHAR(100),
    biography TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_people_type CHECK (person_type IN ('REAL', 'FICTIONAL'))
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id BIGINT UNIQUE,
    role_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_token_hash CHAR(64),
    previous_refresh_token_hash CHAR(64),
    refresh_token_expires_at TIMESTAMPTZ,
    refresh_family_id UUID,
    token_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT chk_users_token_version CHECK (token_version >= 0),
    CONSTRAINT chk_users_refresh_session CHECK (
        (refresh_token_hash IS NULL AND refresh_token_expires_at IS NULL AND refresh_family_id IS NULL)
        OR
        (refresh_token_hash IS NOT NULL AND refresh_token_expires_at IS NOT NULL AND refresh_family_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX uq_users_username_ci ON users (LOWER(username));
CREATE UNIQUE INDEX uq_users_email_ci ON users (LOWER(email));
CREATE INDEX idx_users_role_id ON users(role_id);

CREATE TABLE institutions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    short_name VARCHAR(80),
    slug VARCHAR(180) NOT NULL UNIQUE,
    institution_type VARCHAR(40) NOT NULL DEFAULT 'OTHER',
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    logo_url TEXT,
    description TEXT,
    is_fictional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_institutions_type CHECK (
        institution_type IN ('UNIVERSITY', 'SCHOOL', 'FEDERATION', 'ORGANIZATION', 'OTHER')
    )
);

CREATE TABLE teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    institution_id BIGINT,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(80),
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    team_type VARCHAR(40) NOT NULL DEFAULT 'OTHER',
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    founded_at DATE,
    is_fictional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teams_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

CREATE INDEX idx_teams_institution_id ON teams(institution_id);

CREATE TABLE sports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(50),
    slug VARCHAR(120) NOT NULL UNIQUE,
    sport_type VARCHAR(20) NOT NULL DEFAULT 'SPORT',
    participant_type VARCHAR(20) NOT NULL DEFAULT 'TEAM',
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_sports_type CHECK (sport_type IN ('SPORT', 'ESPORT')),
    CONSTRAINT chk_sports_participant_type CHECK (participant_type IN ('TEAM', 'ATHLETE', 'BOTH'))
);

CREATE TABLE athletes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id BIGINT NOT NULL UNIQUE,
    primary_sport_id BIGINT,
    athlete_code VARCHAR(60) UNIQUE,
    position VARCHAR(100),
    biography TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_athletes_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE RESTRICT,
    CONSTRAINT fk_athletes_primary_sport FOREIGN KEY (primary_sport_id) REFERENCES sports(id) ON DELETE SET NULL
);

CREATE TABLE competitions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sport_id BIGINT NOT NULL,
    organizer_institution_id BIGINT,
    created_by BIGINT,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    season VARCHAR(40) NOT NULL,
    description TEXT,
    competition_type VARCHAR(30) NOT NULL DEFAULT 'LEAGUE',
    format VARCHAR(30) NOT NULL DEFAULT 'ROUND_ROBIN',
    participant_type VARCHAR(20) NOT NULL DEFAULT 'TEAM',
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE,
    location VARCHAR(180),
    points_win SMALLINT NOT NULL DEFAULT 3,
    points_draw SMALLINT NOT NULL DEFAULT 1,
    points_loss SMALLINT NOT NULL DEFAULT 0,
    is_fictional BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_competitions_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE RESTRICT,
    CONSTRAINT fk_competitions_organizer FOREIGN KEY (organizer_institution_id) REFERENCES institutions(id) ON DELETE SET NULL,
    CONSTRAINT fk_competitions_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_competitions_type CHECK (competition_type IN ('LEAGUE', 'CUP', 'TOURNAMENT', 'FRIENDLY', 'OTHER')),
    CONSTRAINT chk_competitions_format CHECK (format IN ('ROUND_ROBIN', 'GROUPS', 'GROUPS_KNOCKOUT', 'KNOCKOUT', 'OTHER')),
    CONSTRAINT chk_competitions_participant_type CHECK (participant_type IN ('TEAM', 'ATHLETE')),
    CONSTRAINT chk_competitions_status CHECK (status IN ('PLANNED', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_competitions_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date),
    CONSTRAINT chk_competitions_points CHECK (points_win >= 0 AND points_draw >= 0 AND points_loss >= 0)
);

CREATE INDEX idx_competitions_sport_status ON competitions(sport_id, status);
CREATE INDEX idx_competitions_season ON competitions(season);

CREATE TABLE competition_participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    competition_id BIGINT NOT NULL,
    participant_type VARCHAR(20) NOT NULL,
    team_id BIGINT,
    athlete_id BIGINT,
    seed INTEGER,
    group_name VARCHAR(80),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_competition_participants_competition FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_competition_participants_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    CONSTRAINT fk_competition_participants_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE RESTRICT,
    CONSTRAINT chk_competition_participants_type CHECK (participant_type IN ('TEAM', 'ATHLETE')),
    CONSTRAINT chk_competition_participants_target CHECK (
        (participant_type = 'TEAM' AND team_id IS NOT NULL AND athlete_id IS NULL)
        OR
        (participant_type = 'ATHLETE' AND athlete_id IS NOT NULL AND team_id IS NULL)
    ),
    CONSTRAINT chk_competition_participants_seed CHECK (seed IS NULL OR seed >= 1),
    CONSTRAINT chk_competition_participants_status CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'DISQUALIFIED')),
    CONSTRAINT uq_competition_participant_composite UNIQUE (competition_id, id)
);

CREATE UNIQUE INDEX uq_competition_team ON competition_participants(competition_id, team_id) WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX uq_competition_athlete ON competition_participants(competition_id, athlete_id) WHERE athlete_id IS NOT NULL;
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id, status);

CREATE TABLE matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    competition_id BIGINT NOT NULL,
    home_participant_id BIGINT NOT NULL,
    away_participant_id BIGINT NOT NULL,
    match_code VARCHAR(60),
    round_name VARCHAR(100),
    stage_name VARCHAR(100),
    match_number INTEGER,
    scheduled_at TIMESTAMPTZ,
    venue VARCHAR(180),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    home_score INTEGER,
    away_score INTEGER,
    home_penalty_score INTEGER,
    away_penalty_score INTEGER,
    winner_participant_id BIGINT,
    notes TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    CONSTRAINT fk_matches_competition FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_home_participant FOREIGN KEY (competition_id, home_participant_id)
        REFERENCES competition_participants(competition_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_matches_away_participant FOREIGN KEY (competition_id, away_participant_id)
        REFERENCES competition_participants(competition_id, id) ON DELETE RESTRICT,
    CONSTRAINT fk_matches_winner FOREIGN KEY (competition_id, winner_participant_id)
        REFERENCES competition_participants(competition_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_matches_different_participants CHECK (home_participant_id <> away_participant_id),
    CONSTRAINT chk_matches_status CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
    CONSTRAINT chk_matches_scores CHECK (
        (home_score IS NULL OR home_score >= 0) AND
        (away_score IS NULL OR away_score >= 0) AND
        (home_penalty_score IS NULL OR home_penalty_score >= 0) AND
        (away_penalty_score IS NULL OR away_penalty_score >= 0)
    ),
    CONSTRAINT chk_matches_completed_score CHECK (
        status <> 'COMPLETED' OR (home_score IS NOT NULL AND away_score IS NOT NULL)
    ),
    CONSTRAINT chk_matches_winner CHECK (
        winner_participant_id IS NULL OR winner_participant_id IN (home_participant_id, away_participant_id)
    ),
    CONSTRAINT chk_matches_penalties_pair CHECK (
        (home_penalty_score IS NULL AND away_penalty_score IS NULL)
        OR
        (home_penalty_score IS NOT NULL AND away_penalty_score IS NOT NULL)
    ),
    CONSTRAINT uq_matches_code UNIQUE (competition_id, match_code)
);

CREATE INDEX idx_matches_competition_schedule ON matches(competition_id, scheduled_at);
CREATE INDEX idx_matches_competition_status ON matches(competition_id, status);

CREATE OR REPLACE VIEW competition_standings AS
WITH match_rows AS (
    SELECT m.competition_id, m.home_participant_id AS competition_participant_id,
           m.home_score AS goals_for, m.away_score AS goals_against
    FROM matches m
    WHERE m.status = 'COMPLETED' AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
    UNION ALL
    SELECT m.competition_id, m.away_participant_id AS competition_participant_id,
           m.away_score AS goals_for, m.home_score AS goals_against
    FROM matches m
    WHERE m.status = 'COMPLETED' AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
),
aggregated AS (
    SELECT competition_id, competition_participant_id,
           COUNT(*)::INTEGER AS played,
           COUNT(*) FILTER (WHERE goals_for > goals_against)::INTEGER AS wins,
           COUNT(*) FILTER (WHERE goals_for = goals_against)::INTEGER AS draws,
           COUNT(*) FILTER (WHERE goals_for < goals_against)::INTEGER AS losses,
           COALESCE(SUM(goals_for), 0)::INTEGER AS goals_for,
           COALESCE(SUM(goals_against), 0)::INTEGER AS goals_against
    FROM match_rows
    GROUP BY competition_id, competition_participant_id
),
rows_for_ranking AS (
    SELECT c.id AS competition_id, cp.id AS competition_participant_id,
           cp.participant_type, cp.group_name,
           COALESCE(t.name, p.display_name) AS participant_name,
           cp.team_id, cp.athlete_id,
           COALESCE(a.played, 0) AS played,
           COALESCE(a.wins, 0) AS wins,
           COALESCE(a.draws, 0) AS draws,
           COALESCE(a.losses, 0) AS losses,
           COALESCE(a.goals_for, 0) AS goals_for,
           COALESCE(a.goals_against, 0) AS goals_against,
           COALESCE(a.goals_for, 0) - COALESCE(a.goals_against, 0) AS goal_difference,
           (COALESCE(a.wins, 0) * c.points_win +
            COALESCE(a.draws, 0) * c.points_draw +
            COALESCE(a.losses, 0) * c.points_loss)::INTEGER AS points
    FROM competition_participants cp
    INNER JOIN competitions c ON c.id = cp.competition_id
    LEFT JOIN aggregated a ON a.competition_id = cp.competition_id
                           AND a.competition_participant_id = cp.id
    LEFT JOIN teams t ON t.id = cp.team_id
    LEFT JOIN athletes at ON at.id = cp.athlete_id
    LEFT JOIN people p ON p.id = at.person_id
    WHERE cp.status = 'ACTIVE'
)
SELECT ROW_NUMBER() OVER (
           PARTITION BY competition_id, group_name
           ORDER BY points DESC, wins DESC, goal_difference DESC, goals_for DESC, participant_name ASC
       )::INTEGER AS position,
       competition_id, competition_participant_id, participant_type, participant_name,
       team_id, athlete_id, group_name, played, wins, draws, losses,
       goals_for, goals_against, goal_difference, points
FROM rows_for_ranking;

COMMIT;
