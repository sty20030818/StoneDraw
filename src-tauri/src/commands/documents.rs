use tauri::AppHandle;

use crate::storage::documents::{
    create_document, get_document_by_id, list_documents, open_document_scene,
    DocumentMetaPayload, SceneFilePayload,
};

use super::{success, CommandError, CommandResult};

#[tauri::command]
pub fn documents_create(
    app: AppHandle,
    title: Option<String>,
) -> CommandResult<DocumentMetaPayload> {
    success(create_document(&app, title)?)
}

#[tauri::command]
pub fn documents_get_by_id(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id)?;
    success(get_document_by_id(&app, &document_id)?)
}

#[tauri::command]
pub fn documents_list(app: AppHandle) -> CommandResult<Vec<DocumentMetaPayload>> {
    success(list_documents(&app)?)
}

#[tauri::command]
pub fn documents_open(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id)?;
    success(get_document_by_id(&app, &document_id)?)
}

#[tauri::command]
pub fn documents_open_scene(
    app: AppHandle,
    document_id: String,
) -> CommandResult<SceneFilePayload> {
    let document_id = validate_document_id(document_id)?;
    success(open_document_scene(&app, &document_id)?)
}

fn validate_document_id(document_id: String) -> Result<String, CommandError> {
    let normalized = document_id.trim().to_string();

    if normalized.is_empty() {
        return Err(CommandError::invalid_argument("document_id 不能为空"));
    }

    Ok(normalized)
}
