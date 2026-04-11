use tauri::AppHandle;

use crate::error::{AppError, AppResult};
use crate::storage::directories::resolve_root_dir;
use crate::storage::documents::{
    create_document_from_root, create_document_version_from_root,
    delete_document_records_from_root, ensure_document_scene_ready,
    get_document_by_id_any_from_root, get_document_by_id_from_root,
    get_trashed_document_by_id_from_root, list_document_versions_from_root,
    list_documents_from_root, list_recent_documents_from_root,
    list_trashed_documents_from_root, mark_document_restored_from_root,
    mark_document_trashed_from_root, open_document_scene_from_root,
    record_document_opened_from_root, rename_document_from_root,
    update_document_after_scene_save, write_document_scene_from_root,
    DocumentMetaPayload, DocumentVersionPayload, SceneFilePayload,
};

/// 文档应用层负责解析 AppHandle，并编排生命周期动作与持久化调用。
pub(crate) fn create_document(
    app: &AppHandle,
    title: Option<String>,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    create_document_from_root(&root_dir, title.as_deref())
}

pub(crate) fn get_document_by_id(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    get_document_by_id_from_root(&root_dir, document_id)
}

pub(crate) fn list_documents(app: &AppHandle) -> AppResult<Vec<DocumentMetaPayload>> {
    let root_dir = resolve_root_dir(app)?;
    list_documents_from_root(&root_dir)
}

pub(crate) fn list_recent_documents(
    app: &AppHandle,
) -> AppResult<Vec<DocumentMetaPayload>> {
    let root_dir = resolve_root_dir(app)?;
    list_recent_documents_from_root(&root_dir)
}

pub(crate) fn list_trashed_documents(
    app: &AppHandle,
) -> AppResult<Vec<DocumentMetaPayload>> {
    let root_dir = resolve_root_dir(app)?;
    list_trashed_documents_from_root(&root_dir)
}

pub(crate) fn rename_document(
    app: &AppHandle,
    document_id: &str,
    title: &str,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    rename_document_from_root(&root_dir, document_id, title)
}

pub(crate) fn move_document_to_trash(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    let existing_document = get_document_by_id_any_from_root(&root_dir, document_id)?;

    if existing_document.is_deleted {
        return Ok(existing_document);
    }

    mark_document_trashed_from_root(&root_dir, document_id)?;
    get_trashed_document_by_id_from_root(&root_dir, document_id)
}

pub(crate) fn restore_document(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    let existing_document = get_document_by_id_any_from_root(&root_dir, document_id)?;

    if !existing_document.is_deleted {
        return Ok(existing_document);
    }

    mark_document_restored_from_root(&root_dir, document_id)?;
    get_document_by_id_from_root(&root_dir, document_id)
}

pub(crate) fn open_document(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    let document_meta = get_document_by_id_from_root(&root_dir, document_id)?;
    ensure_document_scene_ready(&root_dir, &document_meta)?;
    record_document_opened_from_root(&root_dir, document_id)?;
    get_document_by_id_from_root(&root_dir, document_id)
}

pub(crate) fn permanently_delete_document(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<()> {
    let root_dir = resolve_root_dir(app)?;
    let document_dir = delete_document_records_from_root(&root_dir, document_id)?;

    if std::path::Path::new(&document_dir).exists() {
        std::fs::remove_dir_all(&document_dir).map_err(|error| {
            AppError::io(
                "删除文档目录失败",
                format!("documentId={document_id}, path={document_dir}, error={error}"),
            )
            .boxed()
        })?;
    }

    Ok(())
}

pub(crate) fn open_document_scene(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<SceneFilePayload> {
    let root_dir = resolve_root_dir(app)?;
    open_document_scene_from_root(&root_dir, document_id)
}

pub(crate) fn save_document_scene(
    app: &AppHandle,
    scene_payload: SceneFilePayload,
) -> AppResult<DocumentMetaPayload> {
    let root_dir = resolve_root_dir(app)?;
    let write_result = write_document_scene_from_root(&root_dir, scene_payload)?;

    if let Err(error) =
        update_document_after_scene_save(&root_dir, &write_result.document_id, write_result.updated_at)
    {
        let details = error.details.as_deref().unwrap_or_default();
        let details_suffix = if details.is_empty() {
            String::new()
        } else {
            format!(", cause={details}")
        };

        return Err(
            (*error)
                .with_object_id(write_result.document_id.clone())
                .with_details(format!(
                    "documentId={}, scenePath={}, scene 已保存但元数据更新失败{details_suffix}",
                    write_result.document_id, write_result.scene_path
                ))
                .boxed(),
        );
    }

    get_document_by_id_from_root(&root_dir, &write_result.document_id)
}

pub(crate) fn create_document_version(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<DocumentVersionPayload> {
    let root_dir = resolve_root_dir(app)?;
    create_document_version_from_root(&root_dir, document_id)
}

pub(crate) fn list_document_versions(
    app: &AppHandle,
    document_id: &str,
) -> AppResult<Vec<DocumentVersionPayload>> {
    let root_dir = resolve_root_dir(app)?;
    list_document_versions_from_root(&root_dir, document_id)
}
