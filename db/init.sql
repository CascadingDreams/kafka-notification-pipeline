CREATE TABLE IF NOT EXISTS events (
    id          SERIAL PRIMARY KEY, /* internal row id */
    event_id    UUID        UNIQUE NOT NULL, /* business id - in producer and embed in kafka msg */
    event_type  TEXT        NOT NULL,
    user_id     UUID        NOT NULL,
    payload     JSONB       NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL, /* when event happened */
    processed_at TIMESTAMPTZ DEFAULT NOW(), /* when consumer wrote it */
    status      TEXT        DEFAULT 'processed'
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_time ON events(processed_at);