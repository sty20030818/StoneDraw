use super::{CommandError, CommandResult};

#[tauri::command]
pub fn files_resolve_data_dir() -> CommandResult<String> {
    log::warn!("files_resolve_data_dir 命中占位命令。");
    Err(CommandError::unimplemented("files_resolve_data_dir"))
}
