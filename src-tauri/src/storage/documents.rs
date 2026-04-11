use std::time::{SystemTime, UNIX_EPOCH};

use crate::error::{AppError, AppResult};

#[path = "documents/meta.rs"]
mod meta;
#[path = "documents/scene.rs"]
mod scene;
#[path = "documents/versions.rs"]
mod versions;

const DOCUMENT_ID_PREFIX: &str = "doc";
const VERSION_ID_PREFIX: &str = "ver";
const DEFAULT_DOCUMENT_TITLE: &str = "未命名文档";
const DEFAULT_SOURCE_TYPE: &str = "local";
const DEFAULT_SAVE_STATUS: &str = "saved";
const DEFAULT_SCHEMA_VERSION: i64 = 1;
const DEFAULT_VERSION_KIND: &str = "manual";

pub use meta::{
    create_document_from_root, get_document_by_id_from_root,
    get_trashed_document_by_id_from_root, list_documents_from_root,
    list_recent_documents_from_root, mark_document_restored_from_root,
    mark_document_trashed_from_root, record_document_opened_from_root,
    update_document_after_scene_save, DocumentMetaPayload,
};
pub(crate) use meta::{
    delete_document_records_from_root, get_document_by_id_any_from_root,
    list_trashed_documents_from_root, rename_document_from_root,
};
pub use scene::{
    open_document_scene_from_root, write_document_scene_from_root,
    DocumentSceneWriteResult, SceneEnvelopePayload, SceneFilePayload,
    SceneMetaPayload,
};
pub(crate) use scene::ensure_document_scene_ready;
pub(crate) use versions::{
    create_document_version_from_root, list_document_versions_from_root,
    DocumentVersionPayload,
};

#[cfg(test)]
use meta::{
    move_document_to_trash_from_root, open_document_from_root,
    permanently_delete_document_from_root, restore_document_from_root,
};
#[cfg(test)]
use scene::save_document_scene_from_root;

fn default_document_title_owned() -> String {
    DEFAULT_DOCUMENT_TITLE.into()
}

fn default_schema_version() -> i64 {
    DEFAULT_SCHEMA_VERSION
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

fn normalize_required_document_title(title: &str) -> AppResult<String> {
    let normalized = title.trim();

    if normalized.is_empty() {
        return Err(AppError::invalid_argument("title 不能为空").boxed());
    }

    Ok(normalized.to_string())
}

fn current_timestamp_ms() -> AppResult<i64> {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|error| {
        AppError::io("读取系统时间失败", error.to_string())
    })?;

    i64::try_from(duration.as_millis()).map_err(|error| AppError::io("转换时间戳失败", error.to_string()).boxed())
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::commands::CommandErrorCode;
    use crate::storage::database::open_ready_connection;
    use crate::storage::directories::document_path_layout;
    use serde_json::Map;

    use super::scene::read_scene_file;
    use super::{
        create_document_from_root, create_document_version_from_root,
        get_document_by_id_from_root, list_document_versions_from_root,
        list_documents_from_root, list_recent_documents_from_root,
        list_trashed_documents_from_root, move_document_to_trash_from_root,
        open_document_from_root, open_document_scene_from_root,
        permanently_delete_document_from_root, rename_document_from_root,
        restore_document_from_root, save_document_scene_from_root,
    };
    use super::scene::{SceneEnvelopePayload, SceneFilePayload, SceneMetaPayload};

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
