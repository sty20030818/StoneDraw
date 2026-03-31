use crate::storage::directories::{
    prepare_local_directories, read_local_directories, resolve_config_dir_string,
    resolve_data_dir_string, LocalDirectoriesPayload,
};

use super::{success, CommandResult};

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
