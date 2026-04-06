use tauri::AppHandle;

use crate::storage::documents::{
    create_document, get_document_by_id, list_documents, list_recent_documents,
    list_trashed_documents, move_document_to_trash, open_document, open_document_scene,
    permanently_delete_document, rename_document, restore_document, save_document_scene,
    DocumentMetaPayload, SceneFilePayload,
};

use super::{command_result, CommandError, CommandResult};

#[tauri::command]
pub fn documents_create(
    app: AppHandle,
    title: Option<String>,
) -> CommandResult<DocumentMetaPayload> {
    command_result(
        "documents_create",
        "documents-command",
        "create",
        create_document(&app, title),
    )
}

#[tauri::command]
pub fn documents_get_by_id(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        error.attach_command_context("documents_get_by_id", "documents-command", "getById")
    })?;
    command_result(
        "documents_get_by_id",
        "documents-command",
        "getById",
        get_document_by_id(&app, &document_id),
    )
}

#[tauri::command]
pub fn documents_list(app: AppHandle) -> CommandResult<Vec<DocumentMetaPayload>> {
    command_result("documents_list", "documents-command", "list", list_documents(&app))
}

#[tauri::command]
pub fn documents_list_recent(app: AppHandle) -> CommandResult<Vec<DocumentMetaPayload>> {
    command_result(
        "documents_list_recent",
        "documents-command",
        "listRecent",
        list_recent_documents(&app),
    )
}

#[tauri::command]
pub fn documents_list_trashed(app: AppHandle) -> CommandResult<Vec<DocumentMetaPayload>> {
    command_result(
        "documents_list_trashed",
        "documents-command",
        "listTrashed",
        list_trashed_documents(&app),
    )
}

#[tauri::command]
pub fn documents_open(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id)
        .map_err(|error| error.attach_command_context("documents_open", "documents-command", "open"))?;
    command_result(
        "documents_open",
        "documents-command",
        "open",
        open_document(&app, &document_id),
    )
}

#[tauri::command]
pub fn documents_open_scene(
    app: AppHandle,
    document_id: String,
) -> CommandResult<SceneFilePayload> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        error.attach_command_context("documents_open_scene", "documents-command", "openScene")
    })?;
    command_result(
        "documents_open_scene",
        "documents-command",
        "openScene",
        open_document_scene(&app, &document_id),
    )
}

#[tauri::command]
pub fn editor_save_scene(
    app: AppHandle,
    scene: SceneFilePayload,
) -> CommandResult<DocumentMetaPayload> {
    let raw_document_id = scene.document_id.clone();
    let document_id = validate_document_id(raw_document_id.clone()).map_err(|error| {
        error.attach_command_context("editor_save_scene", "documents-command", "saveScene")
    })?;

    if document_id != raw_document_id {
        return Err(
            CommandError::invalid_argument("scene.documentId 非法")
                .with_object_id(raw_document_id)
                .attach_command_context("editor_save_scene", "documents-command", "saveScene"),
        );
    }

    command_result(
        "editor_save_scene",
        "documents-command",
        "saveScene",
        save_document_scene(&app, scene),
    )
}

#[tauri::command]
pub fn documents_rename(
    app: AppHandle,
    document_id: String,
    title: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id)
        .map_err(|error| error.attach_command_context("documents_rename", "documents-command", "rename"))?;
    let title = validate_document_title(title)
        .map_err(|error| error.attach_command_context("documents_rename", "documents-command", "rename"))?;
    command_result(
        "documents_rename",
        "documents-command",
        "rename",
        rename_document(&app, &document_id, &title),
    )
}

#[tauri::command]
pub fn documents_move_to_trash(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        error.attach_command_context(
            "documents_move_to_trash",
            "documents-command",
            "moveToTrash",
        )
    })?;
    command_result(
        "documents_move_to_trash",
        "documents-command",
        "moveToTrash",
        move_document_to_trash(&app, &document_id),
    )
}

#[tauri::command]
pub fn documents_restore(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        error.attach_command_context("documents_restore", "documents-command", "restore")
    })?;
    command_result(
        "documents_restore",
        "documents-command",
        "restore",
        restore_document(&app, &document_id),
    )
}

#[tauri::command]
pub fn documents_permanently_delete(
    app: AppHandle,
    document_id: String,
) -> CommandResult<()> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        error.attach_command_context(
            "documents_permanently_delete",
            "documents-command",
            "permanentlyDelete",
        )
    })?;
    command_result(
        "documents_permanently_delete",
        "documents-command",
        "permanentlyDelete",
        permanently_delete_document(&app, &document_id),
    )
}

fn validate_document_id(document_id: String) -> Result<String, CommandError> {
    let normalized = document_id.trim().to_string();

    if normalized.is_empty() {
        return Err(CommandError::invalid_argument("document_id 不能为空"));
    }

    Ok(normalized)
}

fn validate_document_title(title: String) -> Result<String, CommandError> {
    let normalized = title.trim().to_string();

    if normalized.is_empty() {
        return Err(CommandError::invalid_argument("title 不能为空"));
    }

    Ok(normalized)
}
