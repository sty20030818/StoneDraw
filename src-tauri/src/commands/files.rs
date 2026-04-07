use crate::storage::directories::{
    prepare_local_directories, LocalDirectoriesPayload,
};

use super::{command_result, CommandResult};

#[tauri::command]
pub fn files_prepare_local_directories(
    app: tauri::AppHandle,
) -> CommandResult<LocalDirectoriesPayload> {
    command_result(
        "files_prepare_local_directories",
        "files-command",
        "prepareLocalDirectories",
        prepare_local_directories(&app),
    )
}
