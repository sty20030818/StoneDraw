use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::{params, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tauri::AppHandle;

use crate::commands::CommandError;

use super::database::open_ready_connection;
use super::directories::{document_path_layout, resolve_root_dir};

const DOCUMENT_ID_PREFIX: &str = "doc";
const DEFAULT_DOCUMENT_TITLE: &str = "未命名文档";
const DEFAULT_SOURCE_TYPE: &str = "local";
const DEFAULT_SAVE_STATUS: &str = "saved";
const DEFAULT_SCHEMA_VERSION: i64 = 1;

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
    pub app_state: Map<String, Value>,
    pub files: Map<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneMetaPayload {
    pub title: String,
    pub tags: Vec<String>,
    pub text_index: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneFilePayload {
    pub document_id: String,
    pub schema_version: i64,
    pub updated_at: i64,
    pub scene: SceneEnvelopePayload,
    pub meta: SceneMetaPayload,
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

pub fn open_document_scene(
    app: &AppHandle,
    document_id: &str,
) -> Result<SceneFilePayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    open_document_scene_from_root(&root_dir, document_id)
}

pub(crate) fn create_document_from_root(
    root_dir_path: &Path,
    title: Option<&str>,
) -> Result<DocumentMetaPayload, CommandError> {
    let now = current_timestamp_ms()?;
    let document_id = generate_document_id(now);
    let normalized_title = normalize_document_title(title);
    let layout = document_path_layout(root_dir_path, &document_id);

    ensure_document_layout_ready(&layout)?;

    let scene_payload = create_empty_scene_payload(&document_id, &normalized_title, now);
    write_scene_file(&layout.current_scene_path, &scene_payload)?;

    let document_meta = DocumentMetaPayload {
        id: document_id,
        title: normalized_title,
        current_scene_path: layout.current_scene_path.clone(),
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

pub(crate) fn get_document_by_id_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    connection
        .query_row(
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
            ",
            params![document_id],
            map_document_meta_row,
        )
        .optional()
        .map_err(|error| {
            CommandError::db(
                "读取文档元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?
        .ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 未命中可用文档记录"),
            )
        })
}

pub(crate) fn list_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let mut statement = connection
        .prepare(
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
        )
        .map_err(|error| CommandError::db("准备文档列表查询失败", error.to_string()))?;

    let rows = statement
        .query_map([], map_document_meta_row)
        .map_err(|error| CommandError::db("执行文档列表查询失败", error.to_string()))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| CommandError::db("解析文档列表结果失败", error.to_string()))
}

pub(crate) fn open_document_scene_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<SceneFilePayload, CommandError> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;
    let scene_path = PathBuf::from(&document_meta.current_scene_path);

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

fn map_document_meta_row(row: &Row<'_>) -> rusqlite::Result<DocumentMetaPayload> {
    let is_deleted: i64 = row.get(6)?;

    Ok(DocumentMetaPayload {
        id: row.get(0)?,
        title: row.get(1)?,
        current_scene_path: row.get(2)?,
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
        last_opened_at: row.get(5)?,
        is_deleted: is_deleted != 0,
        deleted_at: row.get(7)?,
        source_type: row.get(8)?,
        save_status: row.get(9)?,
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

fn write_scene_file(path: &str, scene_payload: &SceneFilePayload) -> Result<(), CommandError> {
    let scene_path = PathBuf::from(path);
    let bytes = serde_json::to_vec_pretty(scene_payload).map_err(|error| {
        CommandError::io(
            "序列化空白 scene 文件失败",
            format!("path={}, error={error}", scene_path.display()),
        )
    })?;

    fs::write(&scene_path, bytes).map_err(|error| {
        CommandError::io(
            "写入空白 scene 文件失败",
            format!("path={}, error={error}", scene_path.display()),
        )
    })
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

fn normalize_document_title(title: Option<&str>) -> String {
    title
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_DOCUMENT_TITLE)
        .to_string()
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

    use super::{
        create_document_from_root, get_document_by_id_from_root, list_documents_from_root,
        open_document_scene_from_root,
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
        let fetched_document = get_document_by_id_from_root(&root_directory_path, &created_document.id)
            .expect("按 ID 查询文档应成功");
        let listed_documents =
            list_documents_from_root(&root_directory_path).expect("读取文档列表应成功");
        let scene_payload = open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect("读取文档 scene 应成功");

        assert_eq!(created_document.id, fetched_document.id);
        assert_eq!(created_document.title, "白板 A");
        assert_eq!(listed_documents.len(), 1);
        assert_eq!(listed_documents[0].id, created_document.id);
        assert_eq!(scene_payload.document_id, created_document.id);
        assert_eq!(scene_payload.meta.title, "白板 A");
        assert!(scene_payload.scene.elements.is_empty());
        assert!(PathBuf::from(&created_document.current_scene_path).exists());

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
}
