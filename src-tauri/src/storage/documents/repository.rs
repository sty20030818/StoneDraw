use tauri::AppHandle;

use crate::commands::CommandError;
use crate::storage::directories::resolve_root_dir;

use super::meta::{
    create_document_from_root, get_document_by_id_from_root, list_documents_from_root,
    list_recent_documents_from_root, list_trashed_documents_from_root,
    move_document_to_trash_from_root, open_document_from_root,
    permanently_delete_document_from_root, rename_document_from_root,
    restore_document_from_root, DocumentMetaPayload,
};
use super::scene::{
    open_document_scene_from_root, save_document_scene_from_root, SceneFilePayload,
};
use super::versions::{
    create_document_version_from_root, list_document_versions_from_root,
    DocumentVersionPayload,
};

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
