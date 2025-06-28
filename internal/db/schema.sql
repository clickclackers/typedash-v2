-- USERS
CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    username      VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- CHALLENGES
CREATE TABLE challenge
(
    id        SERIAL PRIMARY KEY,
    title     VARCHAR(255) NOT NULL,
    category  VARCHAR(255) NOT NULL,
    author    VARCHAR(255) NOT NULL,
    text      TEXT    NOT NULL,
    text_hash VARCHAR(255) NOT NULL UNIQUE
);

-- USER OVERVIEW STATS
CREATE TABLE user_overview_stats
(
    user_id            INTEGER PRIMARY KEY REFERENCES users (id),
    single_total_races INTEGER NOT NULL DEFAULT 0,
    single_total_time  INTEGER NOT NULL DEFAULT 0,
    single_avg_wpm     INTEGER NOT NULL DEFAULT 0,
    multi_total_races  INTEGER NOT NULL DEFAULT 0,
    multi_total_time   INTEGER NOT NULL DEFAULT 0,
    multi_avg_wpm      INTEGER NOT NULL DEFAULT 0
);

-- SINGLEPLAYER CHALLENGE STATS
CREATE TABLE single_challenge_stats
(
    user_id      INTEGER NOT NULL REFERENCES users (id),
    challenge_id INTEGER NOT NULL REFERENCES challenge (id),
    created_at   TIMESTAMP DEFAULT NOW(),
    time_taken   INTEGER NOT NULL CHECK (time_taken >= 0),
    wpm          INTEGER NOT NULL CHECK (wpm >= 0),
    accuracy     NUMERIC(5, 2) NOT NULL CHECK (accuracy >= 0.00 AND accuracy <= 100.00),
    PRIMARY KEY (user_id, challenge_id, created_at)
);

-- MULTIPLAYER CHALLENGE STATS
CREATE TABLE multi_challenge_stats
(
    session_id   VARCHAR(255) NOT NULL,
    user_id      INTEGER NOT NULL REFERENCES users (id),
    challenge_id INTEGER NOT NULL REFERENCES challenge (id),
    created_at   TIMESTAMP DEFAULT NOW(),
    time_taken   INTEGER NOT NULL CHECK (time_taken >= 0),
    wpm          INTEGER NOT NULL CHECK (wpm >= 0),
    accuracy     NUMERIC(5, 2) NOT NULL CHECK (accuracy >= 0.00 AND accuracy <= 100.00),
    num_players  INTEGER NOT NULL CHECK (num_players >= 2 AND num_players <= 6),
    position     INTEGER NOT NULL CHECK (position >= 1) AND position <= num_players,
    PRIMARY KEY (session_id, user_id)
);
