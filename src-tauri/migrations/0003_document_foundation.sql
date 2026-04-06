CREATE TABLE IF NOT EXISTS versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    snapshot_path TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_versions_document_created
    ON versions(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS recovery_drafts (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT 'autosave',
    draft_path TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recovery_drafts_document_created
    ON recovery_drafts(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    preview_path TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    asset_kind TEXT NOT NULL,
    asset_path TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_document_updated
    ON assets(document_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS workspace_states (
    id TEXT PRIMARY KEY,
    workspace_scope TEXT NOT NULL,
    active_document_id TEXT,
    state_payload TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workbench_sessions (
    document_id TEXT PRIMARY KEY,
    viewport_state TEXT NOT NULL DEFAULT '{}',
    panel_state TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_search_index (
    document_id TEXT PRIMARY KEY,
    text_index TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

INSERT OR REPLACE INTO settings (key, value, updated_at)
SELECT key, value, updated_at
FROM app_settings
WHERE EXISTS (
    SELECT 1
    FROM sqlite_master
    WHERE type = 'table' AND name = 'app_settings'
);

DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS app_metadata;
