CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL, profile_image TEXT,
    bio TEXT, role_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT chk_users_username CHECK (username ~ '^[A-Za-z0-9._-]+$')
);

CREATE UNIQUE INDEX users_email_unique_idx ON users (LOWER(email));

CREATE TABLE organizations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(150) NOT NULL,
    short_name VARCHAR(80), slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT, logo_url TEXT,
    country VARCHAR(100), is_fictional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE competition_levels (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE,
    short_name VARCHAR(30), slug VARCHAR(80) NOT NULL UNIQUE,
    sequence INTEGER NOT NULL UNIQUE, description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(180) NOT NULL,
    short_name VARCHAR(80), slug VARCHAR(180) NOT NULL UNIQUE,
    type VARCHAR(50), city VARCHAR(100),
    state VARCHAR(100), country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    logo_url TEXT, description TEXT,
    is_fictional BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(150) NOT NULL,
    short_name VARCHAR(80), slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT, logo_url TEXT,
    team_type VARCHAR(50) NOT NULL DEFAULT 'OTHER', is_fictional BOOLEAN NOT NULL DEFAULT FALSE,
    institution_id BIGINT, city VARCHAR(100),
    state VARCHAR(100), country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    founded_at DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teams_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

CREATE INDEX idx_teams_institution ON teams(institution_id);

CREATE TABLE team_identifiers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, team_id BIGINT NOT NULL,
    identifier VARCHAR(80) NOT NULL, identifier_type VARCHAR(50) NOT NULL DEFAULT 'ALIAS',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_identifiers_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uq_team_identifier UNIQUE (team_id, identifier)
);

CREATE INDEX idx_team_identifiers_identifier ON team_identifiers(identifier);

CREATE UNIQUE INDEX uq_team_identifier_primary ON team_identifiers(team_id) WHERE is_primary = TRUE;

CREATE TABLE sports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(120) NOT NULL UNIQUE,
    short_name VARCHAR(50), slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT, icon_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE, category_type VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    gender VARCHAR(20), age_group VARCHAR(80),
    min_age INTEGER, max_age INTEGER,
    format VARCHAR(30), weight_class VARCHAR(50),
    description TEXT, is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_categories_gender CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'MIXED', 'OPEN')),
    CONSTRAINT chk_categories_min_age CHECK (min_age IS NULL OR min_age >= 0),
    CONSTRAINT chk_categories_max_age CHECK (max_age IS NULL OR max_age >= 0),
    CONSTRAINT chk_categories_age_range CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age)
);

CREATE TABLE games (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(150) NOT NULL UNIQUE,
    short_name VARCHAR(80), slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT, developer VARCHAR(150),
    publisher VARCHAR(150), logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athletes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, display_name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE, nationality VARCHAR(100),
    origin VARCHAR(20) NOT NULL DEFAULT 'FICTIONAL', birth_date DATE,
    age_at_reference INTEGER, age_reference_date DATE,
    photo_url TEXT, bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_athletes_origin CHECK (origin IN ('REAL', 'FICTIONAL')),
    CONSTRAINT chk_athletes_age CHECK (age_at_reference IS NULL OR age_at_reference >= 0),
    CONSTRAINT chk_athletes_age_reference CHECK (age_at_reference IS NULL OR age_reference_date IS NOT NULL)
);

CREATE TABLE athlete_teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, athlete_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL, sport_id BIGINT,
    position VARCHAR(100), jersey_number INTEGER,
    joined_at DATE, left_at DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', generation VARCHAR(50),
    group_name VARCHAR(80), leadership_role VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_athlete_teams_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    CONSTRAINT fk_athlete_teams_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_athlete_teams_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE RESTRICT,
    CONSTRAINT chk_athlete_teams_dates CHECK (joined_at IS NULL OR left_at IS NULL OR joined_at <= left_at),
    CONSTRAINT chk_athlete_teams_jersey CHECK (jersey_number IS NULL OR jersey_number >= 0)
);

CREATE INDEX idx_athlete_teams_athlete ON athlete_teams(athlete_id);

CREATE INDEX idx_athlete_teams_team ON athlete_teams(team_id);

CREATE INDEX idx_athlete_teams_sport ON athlete_teams(sport_id);

CREATE TABLE athlete_game_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, athlete_team_id BIGINT NOT NULL,
    game_id BIGINT, username VARCHAR(120) NOT NULL,
    display_name VARCHAR(120), profile_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_accounts_athlete_team FOREIGN KEY (athlete_team_id) REFERENCES athlete_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_accounts_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT,
    CONSTRAINT uq_athlete_game_account UNIQUE (athlete_team_id, game_id)
);

CREATE UNIQUE INDEX uq_game_account_unspecified_game ON athlete_game_accounts (athlete_team_id, LOWER(username)) WHERE game_id IS NULL;

CREATE TABLE championships (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(180) NOT NULL,
    short_name VARCHAR(80), slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT, logo_url TEXT,
    championship_type VARCHAR(50) NOT NULL DEFAULT 'MULTI_SPORT', competition_level_id BIGINT NOT NULL,
    is_fictional BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_championships_level FOREIGN KEY (competition_level_id) REFERENCES competition_levels(id) ON DELETE RESTRICT
);

CREATE TABLE championship_organizations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, championship_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL, role VARCHAR(50) NOT NULL DEFAULT 'ORGANIZER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_championship_organizations_championship FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
    CONSTRAINT fk_championship_organizations_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT uq_championship_organization UNIQUE (championship_id, organization_id)
);

CREATE TABLE championship_editions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, championship_id BIGINT NOT NULL,
    name VARCHAR(180) NOT NULL, year INTEGER NOT NULL,
    edition_number INTEGER, start_date DATE,
    end_date DATE, location VARCHAR(180),
    status VARCHAR(40) NOT NULL DEFAULT 'PLANNED', description TEXT,
    banner_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_championship_editions_championship FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
    CONSTRAINT chk_championship_editions_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date),
    CONSTRAINT chk_championship_editions_year CHECK (year BETWEEN 1900 AND 2200)
);

CREATE INDEX idx_championship_editions_championship ON championship_editions(championship_id);

CREATE TABLE edition_competitions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, edition_id BIGINT NOT NULL,
    sport_id BIGINT NOT NULL, category_id BIGINT,
    game_id BIGINT, name VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE, tournament_format VARCHAR(80),
    start_date DATE, end_date DATE,
    status VARCHAR(40) NOT NULL DEFAULT 'PLANNED', description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_edition_competitions_edition FOREIGN KEY (edition_id) REFERENCES championship_editions(id) ON DELETE CASCADE,
    CONSTRAINT fk_edition_competitions_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE RESTRICT,
    CONSTRAINT fk_edition_competitions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_edition_competitions_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE RESTRICT,
    CONSTRAINT chk_edition_competitions_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

CREATE INDEX idx_edition_competitions_edition ON edition_competitions(edition_id);

CREATE INDEX idx_edition_competitions_sport ON edition_competitions(sport_id);

CREATE INDEX idx_edition_competitions_category ON edition_competitions(category_id);

CREATE INDEX idx_edition_competitions_game ON edition_competitions(game_id);

CREATE TABLE qualification_methods (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE, description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qualification_rules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, source_competition_id BIGINT NOT NULL,
    target_competition_id BIGINT NOT NULL, method_id BIGINT NOT NULL,
    position_from INTEGER, position_to INTEGER,
    minimum_points INTEGER, description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qualification_source FOREIGN KEY (source_competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qualification_target FOREIGN KEY (target_competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qualification_method FOREIGN KEY (method_id) REFERENCES qualification_methods(id) ON DELETE RESTRICT,
    CONSTRAINT chk_qualification_positions CHECK (position_from IS NULL OR position_from >= 1),
    CONSTRAINT chk_qualification_position_range CHECK (position_to IS NULL OR (position_to >= 1 AND (position_from IS NULL OR position_to >= position_from))),
    CONSTRAINT chk_qualification_points CHECK (minimum_points IS NULL OR minimum_points >= 0),
    CONSTRAINT chk_qualification_different_competitions CHECK (source_competition_id <> target_competition_id)
);

CREATE TABLE competition_participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, competition_id BIGINT NOT NULL,
    participant_type VARCHAR(20) NOT NULL, team_id BIGINT,
    athlete_id BIGINT, seed INTEGER,
    group_name VARCHAR(80), status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_competition_participants_competition FOREIGN KEY (competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_competition_participants_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_competition_participants_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    CONSTRAINT chk_competition_participant_type CHECK (participant_type IN ('TEAM', 'ATHLETE')),
    CONSTRAINT chk_competition_participant_target CHECK ( (participant_type = 'TEAM' AND team_id IS NOT NULL AND athlete_id IS NULL) OR (participant_type = 'ATHLETE' AND athlete_id IS NOT NULL AND team_id IS NULL) ),
    CONSTRAINT chk_competition_participant_seed CHECK (seed IS NULL OR seed >= 1),
    CONSTRAINT uq_competition_team_participant UNIQUE (competition_id, team_id),
    CONSTRAINT uq_competition_athlete_participant UNIQUE (competition_id, athlete_id)
);

CREATE TABLE stages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, competition_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL, stage_type VARCHAR(50),
    sequence INTEGER NOT NULL DEFAULT 1, start_date DATE,
    end_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stages_competition FOREIGN KEY (competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT chk_stages_sequence CHECK (sequence >= 1),
    CONSTRAINT chk_stages_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date),
    CONSTRAINT uq_stage_sequence UNIQUE (competition_id, sequence)
);

CREATE TABLE competition_groups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, stage_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL, slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_competition_groups_stage FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE,
    CONSTRAINT uq_group_slug_per_stage UNIQUE (stage_id, slug)
);

CREATE TABLE matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, competition_id BIGINT NOT NULL,
    stage_id BIGINT, group_id BIGINT,
    round_name VARCHAR(100), match_number INTEGER,
    scheduled_at TIMESTAMPTZ, venue VARCHAR(180),
    status VARCHAR(40) NOT NULL DEFAULT 'SCHEDULED', duration_minutes INTEGER,
    notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matches_competition FOREIGN KEY (competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_stage FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL,
    CONSTRAINT fk_matches_group FOREIGN KEY (group_id) REFERENCES competition_groups(id) ON DELETE SET NULL,
    CONSTRAINT chk_matches_number CHECK (match_number IS NULL OR match_number >= 1),
    CONSTRAINT chk_matches_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0)
);

CREATE INDEX idx_matches_competition ON matches(competition_id);

CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);

CREATE TABLE match_participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, match_id BIGINT NOT NULL,
    competition_participant_id BIGINT NOT NULL, side VARCHAR(30),
    score NUMERIC(10,2), result VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_participants_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_participants_competition_participant FOREIGN KEY (competition_participant_id) REFERENCES competition_participants(id) ON DELETE CASCADE,
    CONSTRAINT uq_match_participant UNIQUE (match_id, competition_participant_id)
);

CREATE TABLE standings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, competition_id BIGINT NOT NULL,
    competition_participant_id BIGINT NOT NULL, position INTEGER,
    played INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0, score_for NUMERIC(10,2) NOT NULL DEFAULT 0,
    score_against NUMERIC(10,2) NOT NULL DEFAULT 0, difference NUMERIC(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_standings_competition FOREIGN KEY (competition_id) REFERENCES edition_competitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_standings_participant FOREIGN KEY (competition_participant_id) REFERENCES competition_participants(id) ON DELETE CASCADE,
    CONSTRAINT chk_standings_position CHECK (position IS NULL OR position >= 1),
    CONSTRAINT chk_standings_stats CHECK (played >= 0 AND wins >= 0 AND draws >= 0 AND losses >= 0),
    CONSTRAINT uq_standing_participant UNIQUE (competition_id, competition_participant_id)
);

CREATE TABLE match_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, match_id BIGINT NOT NULL,
    team_id BIGINT, athlete_id BIGINT,
    event_type VARCHAR(50) NOT NULL, event_minute INTEGER,
    description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_events_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_events_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    CONSTRAINT fk_match_events_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL,
    CONSTRAINT chk_match_events_minute CHECK (event_minute IS NULL OR event_minute >= 0)
);

CREATE INDEX idx_match_events_match ON match_events(match_id);

CREATE TABLE calendar_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title VARCHAR(180) NOT NULL,
    description TEXT, event_type VARCHAR(50) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ,
    location VARCHAR(180), championship_edition_id BIGINT,
    competition_id BIGINT, match_id BIGINT,
    created_by BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_calendar_events_edition FOREIGN KEY (championship_edition_id) REFERENCES championship_editions(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_events_competition FOREIGN KEY (competition_id) REFERENCES edition_competitions(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_events_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_events_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_calendar_events_dates CHECK (ends_at IS NULL OR starts_at <= ends_at)
);

CREATE INDEX idx_calendar_events_starts_at ON calendar_events(starts_at);

CREATE TABLE titles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(180) NOT NULL,
    title_type VARCHAR(80), description TEXT,
    championship_id BIGINT, sport_id BIGINT,
    category_id BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_titles_championship FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE SET NULL,
    CONSTRAINT fk_titles_sport FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE SET NULL,
    CONSTRAINT fk_titles_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE team_titles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, team_id BIGINT NOT NULL,
    title_id BIGINT NOT NULL, championship_edition_id BIGINT,
    won_at DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_titles_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_titles_title FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_titles_edition FOREIGN KEY (championship_edition_id) REFERENCES championship_editions(id) ON DELETE SET NULL,
    CONSTRAINT uq_team_title_edition UNIQUE (team_id, title_id, championship_edition_id)
);

CREATE TABLE news (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title VARCHAR(220) NOT NULL,
    slug VARCHAR(240) NOT NULL UNIQUE, subtitle TEXT,
    content TEXT NOT NULL, cover_image TEXT,
    author_id BIGINT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE news_teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, news_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    CONSTRAINT fk_news_teams_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_teams_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uq_news_team UNIQUE (news_id, team_id)
);

CREATE TABLE news_championships (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, news_id BIGINT NOT NULL,
    championship_id BIGINT NOT NULL,
    CONSTRAINT fk_news_championships_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_championships_championship FOREIGN KEY (championship_id) REFERENCES championships(id) ON DELETE CASCADE,
    CONSTRAINT uq_news_championship UNIQUE (news_id, championship_id)
);

CREATE TABLE news_matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, news_id BIGINT NOT NULL,
    match_id BIGINT NOT NULL,
    CONSTRAINT fk_news_matches_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_matches_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT uq_news_match UNIQUE (news_id, match_id)
);

CREATE TABLE newspapers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title VARCHAR(180) NOT NULL,
    edition VARCHAR(80), description TEXT,
    cover_image TEXT, file_url TEXT,
    published_at TIMESTAMPTZ, created_by BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_newspapers_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE highlights (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title VARCHAR(180) NOT NULL,
    description TEXT, media_url TEXT NOT NULL,
    thumbnail_url TEXT, match_id BIGINT,
    created_by BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_highlights_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
    CONSTRAINT fk_highlights_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id BIGINT NOT NULL,
    news_id BIGINT NOT NULL, content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT chk_comments_content CHECK (LENGTH(TRIM(content)) > 0)
);

CREATE TABLE reactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id BIGINT NOT NULL,
    news_id BIGINT NOT NULL, reaction_type VARCHAR(30) NOT NULL DEFAULT 'LIKE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reactions_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_news_reaction UNIQUE (user_id, news_id)
);

CREATE TABLE follows (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follows_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uq_follow UNIQUE (user_id, team_id)
);

CREATE TABLE media (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, uploaded_by BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL, file_path TEXT NOT NULL,
    mime_type VARCHAR(120), file_size BIGINT,
    entity_type VARCHAR(50), entity_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_media_file_size CHECK (file_size IS NULL OR file_size >= 0)
);
