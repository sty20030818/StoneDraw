CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    current_scene_path TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_opened_at INTEGER,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER,
    source_type TEXT NOT NULL DEFAULT 'local',
    save_status TEXT NOT NULL DEFAULT 'saved'
);

CREATE INDEX IF NOT EXISTS idx_documents_updated_at
    ON documents(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_deleted_updated
    ON documents(is_deleted, updated_at DESC);

CREATE TABLE IF NOT EXISTS recent_opens (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    opened_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recent_opens_opened_at
    ON recent_opens(opened_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
