use crate::storage::directories::{
    prepare_local_directories, read_local_directories, resolve_config_dir_string,
    resolve_data_dir_string, resolve_document_path_layout, DocumentPathLayout,
    LocalDirectoriesPayload,
};

use super::{success, CommandError, CommandResult};

#[tauri::command]
pub fn files_prepare_local_directories(
    app: tauri::AppHandle,
) -> CommandResult<LocalDirectoriesPayload> {
    success(prepare_local_directories(&app)?)
}

#[tauri::command]
pub fn files_read_local_directories(
    app: tauri::AppHandle,
) -> CommandResult<LocalDirectoriesPayload> {
    success(read_local_directories(&app)?)
}

#[tauri::command]
pub fn files_resolve_data_dir(app: tauri::AppHandle) -> CommandResult<String> {
    success(resolve_data_dir_string(&app)?)
}

#[tauri::command]
pub fn files_resolve_config_dir(app: tauri::AppHandle) -> CommandResult<String> {
    success(resolve_config_dir_string(&app)?)
}

#[tauri::command]
pub fn files_resolve_document_layout(
    app: tauri::AppHandle,
    document_id: String,
) -> CommandResult<DocumentPathLayout> {
    if document_id.trim().is_empty() {
        return Err(CommandError::invalid_argument("document_id 不能为空"));
    }

    success(resolve_document_path_layout(&app, &document_id)?)
}
