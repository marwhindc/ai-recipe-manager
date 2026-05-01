CREATE TABLE IF NOT EXISTS users (
    id               UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    google_sub       TEXT        NOT NULL UNIQUE,
    email            TEXT        NOT NULL,
    display_name     TEXT        NOT NULL,
    avatar_url       TEXT,
    refresh_token_hash TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
