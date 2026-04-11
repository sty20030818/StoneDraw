use tauri::AppHandle;

use crate::application::documents::{
    create_document, create_document_version, get_document_by_id, list_document_versions,
    list_documents, list_recent_documents, list_trashed_documents, move_document_to_trash, open_document,
    open_document_scene, permanently_delete_document, rename_document, restore_document,
    save_document_scene,
};
use crate::error::{AppError, AppResult};
use crate::storage::documents::{DocumentMetaPayload, DocumentVersionPayload, SceneFilePayload};

use super::{command_result, map_command_error, CommandResult};

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
        map_command_error("documents_get_by_id", "documents-command", "getById", error)
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
        .map_err(|error| map_command_error("documents_open", "documents-command", "open", error))?;
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
        map_command_error("documents_open_scene", "documents-command", "openScene", error)
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
        map_command_error("editor_save_scene", "documents-command", "saveScene", error)
    })?;

    if document_id != raw_document_id {
        return Err(map_command_error(
            "editor_save_scene",
            "documents-command",
            "saveScene",
            AppError::invalid_argument("scene.documentId 非法")
                .with_object_id(raw_document_id)
        ));
    }

    command_result(
        "editor_save_scene",
        "documents-command",
        "saveScene",
        save_document_scene(&app, scene),
    )
}

#[tauri::command]
pub fn versions_create(
    app: AppHandle,
    document_id: String,
) -> CommandResult<DocumentVersionPayload> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        map_command_error("versions_create", "documents-command", "createVersion", error)
    })?;
    command_result(
        "versions_create",
        "documents-command",
        "createVersion",
        create_document_version(&app, &document_id),
    )
}

#[tauri::command]
pub fn versions_list(
    app: AppHandle,
    document_id: String,
) -> CommandResult<Vec<DocumentVersionPayload>> {
    let document_id = validate_document_id(document_id).map_err(|error| {
        map_command_error("versions_list", "documents-command", "listVersions", error)
    })?;
    command_result(
        "versions_list",
        "documents-command",
        "listVersions",
        list_document_versions(&app, &document_id),
    )
}

#[tauri::command]
pub fn documents_rename(
    app: AppHandle,
    document_id: String,
    title: String,
) -> CommandResult<DocumentMetaPayload> {
    let document_id = validate_document_id(document_id)
        .map_err(|error| map_command_error("documents_rename", "documents-command", "rename", error))?;
    let title = validate_document_title(title)
        .map_err(|error| map_command_error("documents_rename", "documents-command", "rename", error))?;
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
        map_command_error(
            "documents_move_to_trash",
            "documents-command",
            "moveToTrash",
            error,
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
        map_command_error("documents_restore", "documents-command", "restore", error)
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
        map_command_error(
            "documents_permanently_delete",
            "documents-command",
            "permanentlyDelete",
            error,
        )
    })?;
    command_result(
        "documents_permanently_delete",
        "documents-command",
        "permanentlyDelete",
        permanently_delete_document(&app, &document_id),
    )
}

fn validate_document_id(document_id: String) -> AppResult<String> {
    let normalized = document_id.trim().to_string();

    if normalized.is_empty() {
        return Err(AppError::invalid_argument("document_id 不能为空").boxed());
    }

    Ok(normalized)
}

fn validate_document_title(title: String) -> AppResult<String> {
    let normalized = title.trim().to_string();

    if normalized.is_empty() {
        return Err(AppError::invalid_argument("title 不能为空").boxed());
    }

    Ok(normalized)
}
