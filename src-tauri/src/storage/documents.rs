use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;

use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tauri::AppHandle;

use crate::commands::CommandError;

use super::database::open_ready_connection;
use super::directories::{document_path_layout, resolve_root_dir};

const DOCUMENT_ID_PREFIX: &str = "doc";
const VERSION_ID_PREFIX: &str = "ver";
const DEFAULT_DOCUMENT_TITLE: &str = "未命名文档";
const DEFAULT_SOURCE_TYPE: &str = "local";
const DEFAULT_SAVE_STATUS: &str = "saved";
const DEFAULT_SCHEMA_VERSION: i64 = 1;
const DEFAULT_VERSION_KIND: &str = "manual";

#[cfg(windows)]
const MOVEFILE_REPLACE_EXISTING: u32 = 0x1;
#[cfg(windows)]
const MOVEFILE_WRITE_THROUGH: u32 = 0x8;

#[cfg(windows)]
unsafe extern "system" {
    fn MoveFileExW(
        existing_file_name: *const u16,
        new_file_name: *const u16,
        flags: u32,
    ) -> i32;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetaPayload {
    pub id: String,
    pub title: String,
    pub current_scene_path: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_opened_at: Option<i64>,
    pub is_deleted: bool,
    pub deleted_at: Option<i64>,
    pub source_type: String,
    pub save_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneEnvelopePayload {
    pub elements: Vec<Value>,
    #[serde(default)]
    pub app_state: Map<String, Value>,
    #[serde(default)]
    pub files: Map<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneMetaPayload {
    #[serde(default = "default_document_title_owned")]
    pub title: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub text_index: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneFilePayload {
    pub document_id: String,
    #[serde(default = "default_schema_version")]
    pub schema_version: i64,
    pub updated_at: i64,
    pub scene: SceneEnvelopePayload,
    pub meta: SceneMetaPayload,
}

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

#[derive(Debug, Clone, Copy)]
enum DocumentFilter {
    Active,
    Deleted,
    Any,
}

pub fn create_document(
    app: &AppHandle,
    title: Option<String>,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    create_document_from_root(&root_dir, title.as_deref())
}

pub fn get_document_by_id(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    get_document_by_id_from_root(&root_dir, document_id)
}

pub fn list_documents(app: &AppHandle) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    list_documents_from_root(&root_dir)
}

pub fn list_recent_documents(app: &AppHandle) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    list_recent_documents_from_root(&root_dir)
}

pub fn list_trashed_documents(app: &AppHandle) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    list_trashed_documents_from_root(&root_dir)
}

pub fn rename_document(
    app: &AppHandle,
    document_id: &str,
    title: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    rename_document_from_root(&root_dir, document_id, title)
}

pub fn move_document_to_trash(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    move_document_to_trash_from_root(&root_dir, document_id)
}

pub fn restore_document(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    restore_document_from_root(&root_dir, document_id)
}

pub fn open_document(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    open_document_from_root(&root_dir, document_id)
}

pub fn permanently_delete_document(
    app: &AppHandle,
    document_id: &str,
) -> Result<(), CommandError> {
    let root_dir = resolve_root_dir(app)?;
    permanently_delete_document_from_root(&root_dir, document_id)
}

pub fn open_document_scene(
    app: &AppHandle,
    document_id: &str,
) -> Result<SceneFilePayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    open_document_scene_from_root(&root_dir, document_id)
}

pub fn save_document_scene(
    app: &AppHandle,
    scene_payload: SceneFilePayload,
) -> Result<DocumentMetaPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    save_document_scene_from_root(&root_dir, scene_payload)
}

pub fn create_document_version(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentVersionPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    create_document_version_from_root(&root_dir, document_id)
}

pub fn list_document_versions(
    app: &AppHandle,
    document_id: &str,
) -> Result<Vec<DocumentVersionPayload>, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    list_document_versions_from_root(&root_dir, document_id)
}

pub fn create_document_from_root(
    root_dir_path: &Path,
    title: Option<&str>,
) -> Result<DocumentMetaPayload, CommandError> {
    let now = current_timestamp_ms()?;
    let document_id = generate_document_id(now);
    let normalized_title = normalize_optional_document_title(title);
    let layout = document_path_layout(root_dir_path, &document_id);

    ensure_document_layout_ready(&layout)?;

    let scene_payload = create_empty_scene_payload(&document_id, &normalized_title, now);
    write_scene_file(Path::new(&layout.current_scene_path), &scene_payload)?;

    let document_meta = DocumentMetaPayload {
        id: document_id,
        title: normalized_title,
        current_scene_path: scene_relative_path(&layout),
        created_at: now,
        updated_at: now,
        last_opened_at: None,
        is_deleted: false,
        deleted_at: None,
        source_type: DEFAULT_SOURCE_TYPE.into(),
        save_status: DEFAULT_SAVE_STATUS.into(),
    };

    if let Err(error) = insert_document_meta(root_dir_path, &document_meta) {
        cleanup_document_directory(&layout.document_dir);
        return Err(error);
    }

    Ok(document_meta)
}

pub fn get_document_by_id_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Active)?.ok_or_else(|| {
        CommandError::not_found(
            "文档不存在",
            format!("documentId={document_id} 未命中可用文档记录"),
        )
    })
}

pub fn list_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            id,
            title,
            current_scene_path,
            created_at,
            updated_at,
            last_opened_at,
            is_deleted,
            deleted_at,
            source_type,
            save_status
        FROM documents
        WHERE is_deleted = 0
        ORDER BY updated_at DESC;
        ",
        "读取文档列表",
    )
}

pub fn list_recent_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            d.id,
            d.title,
            d.current_scene_path,
            d.created_at,
            d.updated_at,
            d.last_opened_at,
            d.is_deleted,
            d.deleted_at,
            d.source_type,
            d.save_status
        FROM recent_opens AS ro
        INNER JOIN documents AS d ON d.id = ro.document_id
        WHERE d.is_deleted = 0
        ORDER BY ro.opened_at DESC;
        ",
        "读取最近打开列表",
    )
}

pub fn list_trashed_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            id,
            title,
            current_scene_path,
            created_at,
            updated_at,
            last_opened_at,
            is_deleted,
            deleted_at,
            source_type,
            save_status
        FROM documents
        WHERE is_deleted = 1
        ORDER BY deleted_at DESC, updated_at DESC;
        ",
        "读取回收站文档列表",
    )
}

pub fn rename_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
    title: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let normalized_title = normalize_required_document_title(title)?;
    let now = current_timestamp_ms()?;
    let connection = open_ready_connection(root_dir_path)?;

    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET title = ?1, updated_at = ?2
            WHERE id = ?3 AND is_deleted = 0;
            ",
            params![normalized_title, now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档标题失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或已删除",
            format!("documentId={document_id} 无法重命名"),
        ));
    }

    get_document_by_id_from_root(root_dir_path, document_id)
}

pub fn move_document_to_trash_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let existing_document = fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Any)?
        .ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法删除"),
            )
        })?;

    if existing_document.is_deleted {
        return Ok(existing_document);
    }

    let now = current_timestamp_ms()?;
    connection
        .execute(
            "
            UPDATE documents
            SET is_deleted = 1, deleted_at = ?1, updated_at = ?1
            WHERE id = ?2 AND is_deleted = 0;
            ",
            params![now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "移动文档到回收站失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Deleted)?.ok_or_else(|| {
        CommandError::not_found(
            "文档不存在",
            format!("documentId={document_id} 删除后未命中记录"),
        )
    })
}

pub fn restore_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let existing_document = fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Any)?
        .ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法恢复"),
            )
        })?;

    if !existing_document.is_deleted {
        return Ok(existing_document);
    }

    let now = current_timestamp_ms()?;
    connection
        .execute(
            "
            UPDATE documents
            SET is_deleted = 0, deleted_at = NULL, updated_at = ?1
            WHERE id = ?2 AND is_deleted = 1;
            ",
            params![now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "恢复文档失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    get_document_by_id_from_root(root_dir_path, document_id)
}

pub fn open_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;

    // 正式打开动作必须先保证 current.scene 就绪，再写最近打开，最后返回最新元数据。
    ensure_document_scene_ready(root_dir_path, &document_meta)?;
    record_document_opened(root_dir_path, document_id)?;

    get_document_by_id_from_root(root_dir_path, document_id)
}

pub fn permanently_delete_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<(), CommandError> {
    let mut connection = open_ready_connection(root_dir_path)?;
    let existing_document =
        fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Any)?.ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法永久删除"),
            )
        })?;
    let layout = document_path_layout(root_dir_path, &existing_document.id);
    let transaction = connection.transaction().map_err(|error| {
        CommandError::db(
            "开启永久删除事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    for sql in [
        "DELETE FROM recent_opens WHERE document_id = ?1;",
        "DELETE FROM document_tags WHERE document_id = ?1;",
        "DELETE FROM document_search_index WHERE document_id = ?1;",
        "DELETE FROM versions WHERE document_id = ?1;",
        "DELETE FROM recovery_drafts WHERE document_id = ?1;",
        "DELETE FROM assets WHERE document_id = ?1;",
        "DELETE FROM workspace_states WHERE active_document_id = ?1;",
        "DELETE FROM workbench_sessions WHERE document_id = ?1;",
        "DELETE FROM documents WHERE id = ?1;",
    ] {
        transaction.execute(sql, params![document_id]).map_err(|error| {
            CommandError::db(
                "清理文档元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;
    }

    transaction.commit().map_err(|error| {
        CommandError::db(
            "提交永久删除事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    if Path::new(&layout.document_dir).exists() {
        fs::remove_dir_all(&layout.document_dir).map_err(|error| {
            CommandError::io(
                "删除文档目录失败",
                format!("documentId={document_id}, path={}, error={error}", layout.document_dir),
            )
        })?;
    }

    Ok(())
}

pub fn open_document_scene_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<SceneFilePayload, CommandError> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;
    let scene_path = ensure_document_scene_ready(root_dir_path, &document_meta)?;
    let scene_payload = read_scene_file(&scene_path)?;

    if scene_payload.document_id != document_id {
        return Err(CommandError::io(
            "读取文档 scene 文件失败",
            format!(
                "path={}, reason=documentId mismatch, expected={}, actual={}",
                scene_path.display(),
                document_id,
                scene_payload.document_id
            ),
        ));
    }

    Ok(scene_payload)
}

pub fn save_document_scene_from_root(
    root_dir_path: &Path,
    mut scene_payload: SceneFilePayload,
) -> Result<DocumentMetaPayload, CommandError> {
    let document_id = scene_payload.document_id.trim().to_string();

    if document_id.is_empty() {
        return Err(CommandError::invalid_argument("scene.documentId 不能为空"));
    }

    let existing_document = get_document_by_id_from_root(root_dir_path, &document_id)?;
    let saved_at = current_timestamp_ms()?;

    scene_payload.document_id = document_id.clone();
    scene_payload.schema_version = default_schema_version();
    scene_payload.updated_at = saved_at;
    scene_payload.meta.title = existing_document.title.clone();

    let scene_path = ensure_document_scene_ready(root_dir_path, &existing_document)?;
    write_scene_file(scene_path.as_path(), &scene_payload)?;

    if let Err(error) = update_document_after_scene_save(root_dir_path, &document_id, saved_at) {
        let details = error.details.as_deref().unwrap_or_default();
        let details_suffix = if details.is_empty() {
            String::new()
        } else {
            format!(", cause={details}")
        };

        return Err(
            error
                .with_object_id(document_id.clone())
                .with_details(format!(
                    "documentId={document_id}, scenePath={}, scene 已保存但元数据更新失败{details_suffix}",
                    scene_path.display()
                )),
        );
    }

    get_document_by_id_from_root(root_dir_path, &document_id)
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

fn map_document_meta_row(row: &Row<'_>) -> rusqlite::Result<DocumentMetaPayload> {
    let is_deleted: i64 = row.get(6)?;
    let document_id: String = row.get(0)?;

    Ok(DocumentMetaPayload {
        id: document_id.clone(),
        title: row.get(1)?,
        current_scene_path: normalize_scene_path_for_payload(&document_id),
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
        last_opened_at: row.get(5)?,
        is_deleted: is_deleted != 0,
        deleted_at: row.get(7)?,
        source_type: row.get(8)?,
        save_status: row.get(9)?,
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

fn normalize_scene_path_for_payload(document_id: &str) -> String {
    PathBuf::from("documents")
        .join(document_id)
        .join("current.scene.json")
        .display()
        .to_string()
}

fn scene_relative_path(layout: &super::directories::DocumentPathLayout) -> String {
    PathBuf::from("documents")
        .join(
            Path::new(&layout.document_dir)
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or_default(),
        )
        .join("current.scene.json")
        .display()
        .to_string()
}

fn version_relative_path(document_id: &str, snapshot_path: &Path) -> String {
    PathBuf::from("documents")
        .join(document_id)
        .join("versions")
        .join(snapshot_path.file_name().and_then(|value| value.to_str()).unwrap_or_default())
        .display()
        .to_string()
}

fn ensure_document_scene_ready(
    root_dir_path: &Path,
    document_meta: &DocumentMetaPayload,
) -> Result<PathBuf, CommandError> {
    let layout = document_path_layout(root_dir_path, &document_meta.id);
    let scene_path = PathBuf::from(&layout.current_scene_path);

    // current.scene 的真实位置固定由 documentId 派生，数据库里的路径字段不再参与运行时决策。
    ensure_document_layout_ready(&layout)?;

    if scene_path.exists() {
        return Ok(scene_path);
    }

    let scene_payload = create_empty_scene_payload(
        &document_meta.id,
        &document_meta.title,
        current_timestamp_ms()?,
    );
    write_scene_file(scene_path.as_path(), &scene_payload).map_err(|error| {
        let details = error.details.as_deref().unwrap_or_default().to_string();

        error
            .with_object_id(document_meta.id.clone())
            .with_details(format!(
                "documentId={}, scenePath={}, scene 缺失且自愈初始化失败, cause={details}",
                document_meta.id,
                scene_path.display(),
            ))
    })?;

    Ok(scene_path)
}

fn fetch_document_meta_by_id(
    connection: &Connection,
    document_id: &str,
    filter: DocumentFilter,
) -> Result<Option<DocumentMetaPayload>, CommandError> {
    let sql = match filter {
        DocumentFilter::Active => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1 AND is_deleted = 0
            LIMIT 1;
            "
        }
        DocumentFilter::Deleted => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1 AND is_deleted = 1
            LIMIT 1;
            "
        }
        DocumentFilter::Any => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1
            LIMIT 1;
            "
        }
    };

    connection
        .query_row(sql, params![document_id], map_document_meta_row)
        .optional()
        .map_err(|error| {
            CommandError::db(
                "读取文档元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })
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

fn list_document_metas(
    connection: &Connection,
    sql: &str,
    operation_label: &str,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let mut statement = connection.prepare(sql).map_err(|error| {
        CommandError::db(
            format!("准备{operation_label}查询失败"),
            error.to_string(),
        )
    })?;

    let rows = statement.query_map([], map_document_meta_row).map_err(|error| {
        CommandError::db(
            format!("执行{operation_label}查询失败"),
            error.to_string(),
        )
    })?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|error| {
        CommandError::db(
            format!("解析{operation_label}结果失败"),
            error.to_string(),
        )
    })
}

fn insert_document_meta(
    root_dir_path: &Path,
    document_meta: &DocumentMetaPayload,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    connection
        .execute(
            "
            INSERT INTO documents (
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);
            ",
            params![
                document_meta.id,
                document_meta.title,
                document_meta.current_scene_path,
                document_meta.created_at,
                document_meta.updated_at,
                document_meta.last_opened_at,
                if document_meta.is_deleted { 1 } else { 0 },
                document_meta.deleted_at,
                document_meta.source_type,
                document_meta.save_status,
            ],
        )
        .map_err(|error| {
            CommandError::db(
                "写入文档元数据失败",
                format!("documentId={}, error={error}", document_meta.id),
            )
        })?;

    Ok(())
}

fn update_document_after_scene_save(
    root_dir_path: &Path,
    document_id: &str,
    saved_at: i64,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET updated_at = ?1, save_status = ?2
            WHERE id = ?3 AND is_deleted = 0;
            ",
            params![saved_at, DEFAULT_SAVE_STATUS, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档保存元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或已删除",
            format!("documentId={document_id} 无法更新保存结果"),
        ));
    }

    Ok(())
}

fn record_document_opened(root_dir_path: &Path, document_id: &str) -> Result<(), CommandError> {
    let mut connection = open_ready_connection(root_dir_path)?;
    let existing_document = fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Active)?
        .ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法记录最近打开"),
            )
        })?;

    let now = current_timestamp_ms()?;
    let transaction = connection.transaction().map_err(|error| {
        CommandError::db(
            "开启最近打开写入事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    transaction
        .execute(
            "
            UPDATE documents
            SET last_opened_at = ?1
            WHERE id = ?2 AND is_deleted = 0;
            ",
            params![now, existing_document.id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档最近打开时间失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    transaction
        .execute(
            "
            INSERT INTO recent_opens (id, document_id, opened_at)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(id) DO UPDATE SET
                document_id = excluded.document_id,
                opened_at = excluded.opened_at;
            ",
            params![document_id, document_id, now],
        )
        .map_err(|error| {
            CommandError::db(
                "写入最近打开记录失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    transaction.commit().map_err(|error| {
        CommandError::db(
            "提交最近打开事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })
}

fn ensure_document_layout_ready(
    layout: &super::directories::DocumentPathLayout,
) -> Result<(), CommandError> {
    for path in [
        &layout.document_dir,
        &layout.assets_dir,
        &layout.versions_dir,
        &layout.recovery_dir,
    ] {
        fs::create_dir_all(path).map_err(|error| {
            CommandError::io(
                "创建文档目录结构失败",
                format!("path={path}, error={error}"),
            )
        })?;
    }

    Ok(())
}

fn create_empty_scene_payload(document_id: &str, title: &str, updated_at: i64) -> SceneFilePayload {
    SceneFilePayload {
        document_id: document_id.into(),
        schema_version: DEFAULT_SCHEMA_VERSION,
        updated_at,
        scene: SceneEnvelopePayload {
            elements: Vec::new(),
            app_state: Map::new(),
            files: Map::new(),
        },
        meta: SceneMetaPayload {
            title: title.into(),
            tags: Vec::new(),
            text_index: String::new(),
        },
    }
}

fn default_document_title_owned() -> String {
    DEFAULT_DOCUMENT_TITLE.into()
}

fn default_schema_version() -> i64 {
    DEFAULT_SCHEMA_VERSION
}

fn write_scene_file(path: &Path, scene_payload: &SceneFilePayload) -> Result<(), CommandError> {
    let bytes = serde_json::to_vec_pretty(scene_payload).map_err(|error| {
        CommandError::io(
            "序列化 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
    })?;
    let temp_path = create_scene_temp_path(path)?;
    let write_result = (|| -> Result<(), CommandError> {
        let mut temp_file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp_path)
            .map_err(|error| {
                CommandError::io(
                    "创建临时 scene 文件失败",
                    format!("path={}, error={error}", temp_path.display()),
                )
            })?;

        temp_file.write_all(&bytes).map_err(|error| {
            CommandError::io(
                "写入临时 scene 文件失败",
                format!("path={}, error={error}", temp_path.display()),
            )
        })?;
        temp_file.sync_all().map_err(|error| {
            CommandError::io(
                "刷盘临时 scene 文件失败",
                format!("path={}, error={error}", temp_path.display()),
            )
        })?;
        drop(temp_file);

        replace_file_atomically(&temp_path, path).map_err(|error| {
            CommandError::io(
                "替换正式 scene 文件失败",
                format!(
                    "tempPath={}, targetPath={}, error={error}",
                    temp_path.display(),
                    path.display()
                ),
            )
        })?;

        Ok(())
    })();

    if write_result.is_err() && temp_path.exists() {
        let _ = fs::remove_file(&temp_path);
    }

    write_result
}

fn create_scene_temp_path(path: &Path) -> Result<PathBuf, CommandError> {
    let parent = path.parent().ok_or_else(|| {
        CommandError::io(
            "解析临时 scene 文件目录失败",
            format!("path={} 缺少父目录", path.display()),
        )
    })?;
    let file_name = path.file_name().and_then(|value| value.to_str()).ok_or_else(|| {
        CommandError::io(
            "解析临时 scene 文件名失败",
            format!("path={} 缺少有效文件名", path.display()),
        )
    })?;
    let timestamp = current_timestamp_ms()?;

    Ok(parent.join(format!(
        "{file_name}.tmp-{timestamp}-{}",
        std::process::id()
    )))
}

#[cfg(windows)]
fn replace_file_atomically(source: &Path, target: &Path) -> std::io::Result<()> {
    let source_wide = encode_wide_path(source);
    let target_wide = encode_wide_path(target);
    let result = unsafe {
        MoveFileExW(
            source_wide.as_ptr(),
            target_wide.as_ptr(),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };

    if result == 0 {
        return Err(std::io::Error::last_os_error());
    }

    Ok(())
}

#[cfg(windows)]
fn encode_wide_path(path: &Path) -> Vec<u16> {
    path.as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

#[cfg(not(windows))]
fn replace_file_atomically(source: &Path, target: &Path) -> std::io::Result<()> {
    fs::rename(source, target)
}

fn read_scene_file(path: &Path) -> Result<SceneFilePayload, CommandError> {
    let raw_content = fs::read_to_string(path).map_err(|error| {
        CommandError::io(
            "读取文档 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
    })?;

    serde_json::from_str::<SceneFilePayload>(&raw_content).map_err(|error| {
        CommandError::io(
            "解析文档 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
    })
}

fn cleanup_document_directory(document_dir: &str) {
    let document_path = PathBuf::from(document_dir);

    if !document_path.exists() {
        return;
    }

    if let Err(error) = fs::remove_dir_all(&document_path) {
        log::warn!(
            "清理文档目录补偿失败: path={}, error={}",
            document_path.display(),
            error
        );
    }
}

fn generate_document_id(timestamp: i64) -> String {
    format!("{DOCUMENT_ID_PREFIX}-{timestamp}-{}", std::process::id())
}

fn generate_version_id(document_id: &str, timestamp: i64) -> String {
    format!(
        "{VERSION_ID_PREFIX}-{document_id}-{timestamp}-{}",
        std::process::id()
    )
}

fn normalize_optional_document_title(title: Option<&str>) -> String {
    title
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_DOCUMENT_TITLE)
        .to_string()
}

fn normalize_required_document_title(title: &str) -> Result<String, CommandError> {
    let normalized = title.trim();

    if normalized.is_empty() {
        return Err(CommandError::invalid_argument("title 不能为空"));
    }

    Ok(normalized.to_string())
}

fn current_timestamp_ms() -> Result<i64, CommandError> {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|error| {
        CommandError::io("读取系统时间失败", error.to_string())
    })?;

    i64::try_from(duration.as_millis())
        .map_err(|error| CommandError::io("转换时间戳失败", error.to_string()))
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::commands::CommandErrorCode;
    use crate::storage::database::open_ready_connection;
    use crate::storage::directories::document_path_layout;
    use serde_json::Map;

    use super::{
        create_document_from_root, get_document_by_id_from_root, list_documents_from_root,
        list_recent_documents_from_root, list_trashed_documents_from_root,
        move_document_to_trash_from_root, open_document_from_root, open_document_scene_from_root,
        permanently_delete_document_from_root, read_scene_file, rename_document_from_root,
        restore_document_from_root, save_document_scene_from_root,
        SceneEnvelopePayload, SceneFilePayload, SceneMetaPayload,
    };

    fn unique_temp_path(name: &str) -> std::path::PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("系统时间应晚于 UNIX_EPOCH")
            .as_nanos();

        std::env::temp_dir().join(format!("stonedraw-documents-{name}-{timestamp}"))
    }

    #[test]
    fn create_list_get_and_open_document_scene_work_together() {
        let root_directory_path = unique_temp_path("full-cycle");

        let created_document = create_document_from_root(&root_directory_path, Some("白板 A"))
            .expect("创建文档应成功");
        let fetched_document =
            get_document_by_id_from_root(&root_directory_path, &created_document.id)
                .expect("按 ID 查询文档应成功");
        let listed_documents =
            list_documents_from_root(&root_directory_path).expect("读取文档列表应成功");
        let opened_document = open_document_from_root(&root_directory_path, &created_document.id)
            .expect("正式打开文档应成功");
        let scene_payload =
            open_document_scene_from_root(&root_directory_path, &created_document.id)
                .expect("读取文档 scene 应成功");
        let recent_documents =
            list_recent_documents_from_root(&root_directory_path).expect("最近打开列表应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);

        assert_eq!(created_document.id, fetched_document.id);
        assert_eq!(created_document.title, "白板 A");
        assert_eq!(opened_document.last_opened_at, recent_documents[0].last_opened_at);
        assert_eq!(listed_documents.len(), 1);
        assert_eq!(listed_documents[0].id, created_document.id);
        assert_eq!(scene_payload.document_id, created_document.id);
        assert_eq!(scene_payload.meta.title, "白板 A");
        assert!(scene_payload.scene.elements.is_empty());
        assert_eq!(
            created_document.current_scene_path,
            PathBuf::from("documents")
                .join(&created_document.id)
                .join("current.scene.json")
                .display()
                .to_string()
        );
        assert!(PathBuf::from(&layout.current_scene_path).exists());
        assert_eq!(recent_documents.len(), 1);
        assert_eq!(recent_documents[0].id, created_document.id);
        assert!(recent_documents[0].last_opened_at.is_some());

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn rename_trash_restore_and_recent_open_flow_work_together() {
        let root_directory_path = unique_temp_path("lifecycle");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 B"))
            .expect("创建文档应成功");

        let renamed_document =
            rename_document_from_root(&root_directory_path, &created_document.id, "白板 B-重命名")
                .expect("重命名文档应成功");
        let _opened_document = open_document_from_root(&root_directory_path, &created_document.id)
            .expect("正式打开文档应成功写入最近打开");
        let trashed_document =
            move_document_to_trash_from_root(&root_directory_path, &created_document.id)
                .expect("删除到回收站应成功");

        let active_documents =
            list_documents_from_root(&root_directory_path).expect("主列表应可读取");
        let recent_documents =
            list_recent_documents_from_root(&root_directory_path).expect("最近打开列表应可读取");
        let trashed_documents =
            list_trashed_documents_from_root(&root_directory_path).expect("回收站列表应可读取");
        let restored_document =
            restore_document_from_root(&root_directory_path, &created_document.id)
                .expect("恢复文档应成功");

        assert_eq!(renamed_document.title, "白板 B-重命名");
        assert!(trashed_document.is_deleted);
        assert!(active_documents.is_empty());
        assert!(recent_documents.is_empty());
        assert_eq!(trashed_documents.len(), 1);
        assert_eq!(trashed_documents[0].id, created_document.id);
        assert_eq!(restored_document.title, "白板 B-重命名");
        assert!(!restored_document.is_deleted);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn open_document_scene_returns_not_found_for_missing_document() {
        let root_directory_path = unique_temp_path("missing-document");

        let error = open_document_scene_from_root(&root_directory_path, "doc-missing")
            .expect_err("不存在的文档不应返回空白 scene");

        assert_eq!(error.code, CommandErrorCode::NotFound);

        if root_directory_path.exists() {
            std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
        }
    }

    #[test]
    fn save_document_scene_updates_file_and_metadata() {
        let root_directory_path = unique_temp_path("save-scene");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 C"))
            .expect("创建文档应成功");

        let save_result = save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![serde_json::json!({
                        "id": "element-save-1",
                        "type": "rectangle"
                    })],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "不会覆盖文档标题".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect("保存 scene 应成功");
        let reopened_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect("重新读取 scene 应成功");

        assert_eq!(save_result.id, created_document.id);
        assert!(save_result.updated_at >= created_document.updated_at);
        assert_eq!(reopened_scene.meta.title, "白板 C");
        assert_eq!(reopened_scene.scene.elements.len(), 1);
        assert_eq!(reopened_scene.scene.elements[0]["id"], "element-save-1");

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn save_document_scene_overwrites_current_scene_with_latest_content() {
        let root_directory_path = unique_temp_path("save-scene-overwrite");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 D"))
            .expect("创建文档应成功");

        save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![serde_json::json!({ "id": "element-save-1" })],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 D".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect("第一次保存应成功");
        save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 2,
                scene: SceneEnvelopePayload {
                    elements: vec![
                        serde_json::json!({ "id": "element-save-2" }),
                        serde_json::json!({ "id": "element-save-3" }),
                    ],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 D".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect("第二次保存应成功");

        let reopened_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect("重新读取 scene 应成功");

        assert_eq!(reopened_scene.scene.elements.len(), 2);
        assert_eq!(reopened_scene.scene.elements[0]["id"], "element-save-2");
        assert_eq!(reopened_scene.scene.elements[1]["id"], "element-save-3");

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn save_document_scene_does_not_update_metadata_when_scene_write_fails() {
        let root_directory_path = unique_temp_path("save-scene-write-failure");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 E"))
            .expect("创建文档应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);
        let scene_path = PathBuf::from(&layout.current_scene_path);

        std::fs::remove_file(&scene_path).expect("原始 scene 文件应可删除");
        std::fs::create_dir_all(&scene_path).expect("scene 目录路径应可创建");

        let document_before_save =
            get_document_by_id_from_root(&root_directory_path, &created_document.id)
                .expect("保存前应可读取元数据");
        let error = save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![serde_json::json!({ "id": "element-write-fail" })],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 E".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect_err("scene 写入失败时不应保存成功");
        let document_after_failure =
            get_document_by_id_from_root(&root_directory_path, &created_document.id)
                .expect("失败后仍应可读取元数据");

        assert_eq!(error.code, CommandErrorCode::IoError);
        assert_eq!(document_after_failure.updated_at, document_before_save.updated_at);
        assert!(PathBuf::from(&layout.current_scene_path).is_dir());

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn save_document_scene_reports_metadata_failure_after_scene_written() {
        let root_directory_path = unique_temp_path("save-scene-db-failure");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 F"))
            .expect("创建文档应成功");
        let connection = open_ready_connection(&root_directory_path).expect("数据库连接应成功");

        connection
            .execute(
                "
                CREATE TRIGGER fail_scene_save_metadata_update
                BEFORE UPDATE ON documents
                BEGIN
                    SELECT RAISE(FAIL, 'forced-metadata-update-error');
                END;
                ",
                [],
            )
            .expect("测试前置 trigger 应可创建");

        let document_before_save =
            get_document_by_id_from_root(&root_directory_path, &created_document.id)
                .expect("保存前应可读取元数据");
        let error = save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![serde_json::json!({ "id": "element-db-fail" })],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 F".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect_err("元数据更新失败时不应返回成功");
        let document_after_failure =
            get_document_by_id_from_root(&root_directory_path, &created_document.id)
                .expect("失败后仍应可读取元数据");
        let layout = document_path_layout(&root_directory_path, &created_document.id);
        let reopened_scene = read_scene_file(PathBuf::from(&layout.current_scene_path).as_path())
            .expect("scene 文件应保留最新写入结果");

        assert_eq!(error.code, CommandErrorCode::DbError);
        assert!(
            error
                .details
                .unwrap_or_default()
                .contains("scene 已保存但元数据更新失败")
        );
        assert_eq!(document_after_failure.updated_at, document_before_save.updated_at);
        assert_eq!(reopened_scene.scene.elements.len(), 1);
        assert_eq!(reopened_scene.scene.elements[0]["id"], "element-db-fail");

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn save_document_scene_rejects_invalid_payload() {
        let root_directory_path = unique_temp_path("save-scene-invalid");
        let _created_document = create_document_from_root(&root_directory_path, Some("白板 G"))
            .expect("创建文档应成功");

        let error = save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: "   ".into(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 G".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect_err("非法 payload 不应保存成功");

        assert_eq!(error.code, CommandErrorCode::InvalidArgument);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn save_document_scene_returns_not_found_for_unknown_document() {
        let root_directory_path = unique_temp_path("save-scene-missing-document");
        let _created_document = create_document_from_root(&root_directory_path, Some("白板 H"))
            .expect("创建文档应成功");

        let error = save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: "doc-missing".into(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 H".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect_err("不存在的文档不应保存成功");

        assert_eq!(error.code, CommandErrorCode::NotFound);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn open_document_scene_returns_io_error_for_corrupted_scene_file() {
        let root_directory_path = unique_temp_path("open-scene-corrupted");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 I"))
            .expect("创建文档应成功");

        let layout = document_path_layout(&root_directory_path, &created_document.id);

        std::fs::write(&layout.current_scene_path, "{ broken json }")
            .expect("损坏 scene 文件应可写入");

        let error = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect_err("损坏 scene 文件不应读取成功");

        assert_eq!(error.code, CommandErrorCode::IoError);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn open_document_scene_returns_io_error_for_document_id_mismatch() {
        let root_directory_path = unique_temp_path("open-scene-mismatch");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 J"))
            .expect("创建文档应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);

        std::fs::write(
            &layout.current_scene_path,
            serde_json::json!({
                "documentId": "doc-other",
                "schemaVersion": 1,
                "updatedAt": 1,
                "scene": {
                    "elements": [],
                    "appState": {},
                    "files": {}
                },
                "meta": {
                    "title": "白板 J",
                    "tags": [],
                    "textIndex": ""
                }
            })
            .to_string(),
        )
        .expect("错误 documentId 的 scene 文件应可写入");

        let error = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect_err("documentId 不匹配时不应读取成功");

        assert_eq!(error.code, CommandErrorCode::IoError);
        assert!(error.details.unwrap_or_default().contains("documentId mismatch"));

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn open_document_from_root_self_heals_missing_current_scene() {
        let root_directory_path = unique_temp_path("open-scene-self-heal");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 K"))
            .expect("创建文档应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);

        std::fs::remove_file(&layout.current_scene_path).expect("原始 scene 文件应可删除");

        let opened_document = open_document_from_root(&root_directory_path, &created_document.id)
            .expect("缺失 current.scene 时应自愈打开成功");
        let scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect("自愈后 scene 应可读取");

        assert!(opened_document.last_opened_at.is_some());
        assert_eq!(scene.document_id, created_document.id);
        assert!(PathBuf::from(&layout.current_scene_path).exists());

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn create_document_version_persists_snapshot_and_metadata() {
        let root_directory_path = unique_temp_path("create-version");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 Version"))
            .expect("创建文档应成功");

        save_document_scene_from_root(
            &root_directory_path,
            SceneFilePayload {
                document_id: created_document.id.clone(),
                schema_version: 1,
                updated_at: 1,
                scene: SceneEnvelopePayload {
                    elements: vec![serde_json::json!({ "id": "version-element-1" })],
                    app_state: Map::new(),
                    files: Map::new(),
                },
                meta: SceneMetaPayload {
                    title: "白板 Version".into(),
                    tags: vec![],
                    text_index: String::new(),
                },
            },
        )
        .expect("保存最新 current.scene 应成功");

        let version = create_document_version_from_root(&root_directory_path, &created_document.id)
            .expect("创建手动版本应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);
        let snapshot_path = PathBuf::from(&layout.versions_dir).join(format!("{}.scene.json", version.id));
        let listed_versions =
            list_document_versions_from_root(&root_directory_path, &created_document.id)
                .expect("读取版本列表应成功");
        let snapshot_scene =
            read_scene_file(snapshot_path.as_path()).expect("版本快照文件应可读取");

        assert_eq!(version.document_id, created_document.id);
        assert_eq!(version.version_number, 1);
        assert_eq!(version.version_kind, "manual");
        assert_eq!(version.label, "手动版本 1");
        assert!(snapshot_path.exists());
        assert_eq!(snapshot_scene.scene.elements.len(), 1);
        assert_eq!(snapshot_scene.scene.elements[0]["id"], "version-element-1");
        assert_eq!(listed_versions.len(), 1);
        assert_eq!(listed_versions[0].id, version.id);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn list_document_versions_returns_newest_first() {
        let root_directory_path = unique_temp_path("list-versions");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 Version List"))
            .expect("创建文档应成功");

        let version_one = create_document_version_from_root(&root_directory_path, &created_document.id)
            .expect("第一次创建版本应成功");
        let version_two = create_document_version_from_root(&root_directory_path, &created_document.id)
            .expect("第二次创建版本应成功");
        let listed_versions =
            list_document_versions_from_root(&root_directory_path, &created_document.id)
                .expect("读取版本列表应成功");

        assert_eq!(version_one.version_number, 1);
        assert_eq!(version_two.version_number, 2);
        assert_eq!(listed_versions.len(), 2);
        assert_eq!(listed_versions[0].id, version_two.id);
        assert_eq!(listed_versions[0].version_number, 2);
        assert_eq!(listed_versions[1].id, version_one.id);
        assert_eq!(listed_versions[1].version_number, 1);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn create_document_version_cleans_snapshot_when_metadata_insert_fails() {
        let root_directory_path = unique_temp_path("create-version-db-failure");
        let created_document =
            create_document_from_root(&root_directory_path, Some("白板 Version Failure"))
                .expect("创建文档应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);
        let connection = open_ready_connection(&root_directory_path).expect("数据库连接应成功");

        connection
            .execute(
                "
                CREATE TRIGGER fail_version_insert
                BEFORE INSERT ON versions
                BEGIN
                    SELECT RAISE(FAIL, 'forced-version-insert-error');
                END;
                ",
                [],
            )
            .expect("测试前置 trigger 应可创建");

        let error = create_document_version_from_root(&root_directory_path, &created_document.id)
            .expect_err("版本元数据写入失败时不应返回成功");
        let version_snapshot_count = std::fs::read_dir(&layout.versions_dir)
            .expect("版本目录应可读取")
            .count();

        assert_eq!(error.code, CommandErrorCode::DbError);
        assert!(error.details.unwrap_or_default().contains("创建版本元数据失败"));
        assert_eq!(version_snapshot_count, 0);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn permanently_delete_document_removes_metadata_and_directory() {
        let root_directory_path = unique_temp_path("permanent-delete");
        let created_document = create_document_from_root(&root_directory_path, Some("白板 L"))
            .expect("创建文档应成功");
        let layout = document_path_layout(&root_directory_path, &created_document.id);

        permanently_delete_document_from_root(&root_directory_path, &created_document.id)
            .expect("永久删除应成功");

        let error = get_document_by_id_from_root(&root_directory_path, &created_document.id)
            .expect_err("永久删除后文档元数据应不存在");

        assert_eq!(error.code, CommandErrorCode::NotFound);
        assert!(!PathBuf::from(&layout.document_dir).exists());

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }
}
