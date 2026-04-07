use std::fs;
use std::path::{Path, PathBuf};

use rusqlite::{params, Connection, Row};
use serde::{Deserialize, Serialize};

use crate::commands::CommandError;
use crate::storage::database::open_ready_connection;
use crate::storage::directories::document_path_layout;

use super::meta::get_document_by_id_from_root;
use super::scene::{open_document_scene_from_root, write_scene_file};
use super::{current_timestamp_ms, generate_version_id, DEFAULT_VERSION_KIND};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentVersionPayload {
    pub id: String,
    pub document_id: String,
    pub version_number: i64,
    pub version_kind: String,
    pub label: String,
    pub snapshot_path: String,
    pub created_at: i64,
    pub source_updated_at: i64,
}

pub fn create_document_version_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentVersionPayload, CommandError> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;
    let current_scene = open_document_scene_from_root(root_dir_path, document_id)?;
    let layout = document_path_layout(root_dir_path, document_id);
    let snapshot_directory = PathBuf::from(&layout.versions_dir);
    let created_at = current_timestamp_ms()?;
    let version_id = generate_version_id(document_id, created_at);
    let snapshot_path = snapshot_directory.join(format!("{version_id}.scene.json"));
    let connection = open_ready_connection(root_dir_path)?;
    let version_number = read_next_version_number(&connection, document_id)?;
    let version_payload = DocumentVersionPayload {
        id: version_id,
        document_id: document_id.to_string(),
        version_number,
        version_kind: DEFAULT_VERSION_KIND.into(),
        label: format!("手动版本 {version_number}"),
        snapshot_path: version_relative_path(document_id, snapshot_path.as_path()),
        created_at,
        source_updated_at: current_scene.updated_at,
    };

    fs::create_dir_all(&snapshot_directory).map_err(|error| {
        CommandError::io(
            "创建版本快照目录失败",
            format!(
                "documentId={document_id}, path={}, error={error}",
                snapshot_directory.display()
            ),
        )
    })?;
    write_scene_file(snapshot_path.as_path(), &current_scene)?;

    if let Err(error) = insert_document_version(root_dir_path, &version_payload) {
        let cleanup_result = fs::remove_file(&snapshot_path);
        let cleanup_suffix = match cleanup_result {
            Ok(()) => String::new(),
            Err(cleanup_error) => format!(", cleanupError={cleanup_error}"),
        };

        return Err(error.with_details(format!(
            "documentId={}, snapshotPath={}, 创建版本元数据失败{cleanup_suffix}",
            document_meta.id,
            snapshot_path.display()
        )));
    }

    Ok(version_payload)
}

pub fn list_document_versions_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<Vec<DocumentVersionPayload>, CommandError> {
    let _document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;
    let connection = open_ready_connection(root_dir_path)?;
    let mut statement = connection
        .prepare(
            "
            SELECT
                id,
                document_id,
                version_number,
                version_kind,
                label,
                snapshot_path,
                created_at,
                source_updated_at
            FROM versions
            WHERE document_id = ?1
            ORDER BY created_at DESC, version_number DESC;
            ",
        )
        .map_err(|error| {
            CommandError::db(
                "读取文档版本列表失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;
    let rows = statement
        .query_map(params![document_id], map_document_version_row)
        .map_err(|error| {
            CommandError::db(
                "遍历文档版本列表失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|error| {
        CommandError::db(
            "组装文档版本列表失败",
            format!("documentId={document_id}, error={error}"),
        )
    })
}

fn map_document_version_row(row: &Row<'_>) -> rusqlite::Result<DocumentVersionPayload> {
    Ok(DocumentVersionPayload {
        id: row.get(0)?,
        document_id: row.get(1)?,
        version_number: row.get(2)?,
        version_kind: row.get(3)?,
        label: row.get(4)?,
        snapshot_path: row.get(5)?,
        created_at: row.get(6)?,
        source_updated_at: row.get(7)?,
    })
}

fn version_relative_path(document_id: &str, snapshot_path: &Path) -> String {
    PathBuf::from("documents")
        .join(document_id)
        .join("versions")
        .join(snapshot_path.file_name().and_then(|value| value.to_str()).unwrap_or_default())
        .display()
        .to_string()
}

fn read_next_version_number(
    connection: &Connection,
    document_id: &str,
) -> Result<i64, CommandError> {
    connection
        .query_row(
            "
            SELECT COALESCE(MAX(version_number), 0) + 1
            FROM versions
            WHERE document_id = ?1;
            ",
            params![document_id],
            |row| row.get(0),
        )
        .map_err(|error| {
            CommandError::db(
                "读取下一个版本号失败",
                format!("documentId={document_id}, error={error}"),
            )
        })
}

fn insert_document_version(
    root_dir_path: &Path,
    version_payload: &DocumentVersionPayload,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    connection
        .execute(
            "
            INSERT INTO versions (
                id,
                document_id,
                version_number,
                version_kind,
                label,
                snapshot_path,
                created_at,
                source_updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8);
            ",
            params![
                version_payload.id,
                version_payload.document_id,
                version_payload.version_number,
                version_payload.version_kind,
                version_payload.label,
                version_payload.snapshot_path,
                version_payload.created_at,
                version_payload.source_updated_at,
            ],
        )
        .map_err(|error| {
            CommandError::db(
                "写入文档版本元数据失败",
                format!(
                    "documentId={}, versionId={}, error={error}",
                    version_payload.document_id, version_payload.id
                ),
            )
        })?;

    Ok(())
}
