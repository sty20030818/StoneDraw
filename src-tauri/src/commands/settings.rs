use serde::Serialize;

use super::{command_result, CommandError, CommandResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsPayload {
    pub language: String,
    pub theme: String,
}

#[tauri::command]
pub fn settings_read() -> CommandResult<SettingsPayload> {
    log::warn!("settings_read 命中占位命令。");
    command_result(
        "settings_read",
        "settings-command",
        "read",
        Err(CommandError::unimplemented("settings_read")),
    )
}

#[tauri::command]
pub fn settings_save(language: String, theme: String) -> CommandResult<SettingsPayload> {
    if language.trim().is_empty() || theme.trim().is_empty() {
        return Err(
            CommandError::invalid_argument("language 和 theme 不能为空").attach_command_context(
                "settings_save",
                "settings-command",
                "save",
            ),
        );
    }

    log::warn!("settings_save 命中占位命令。");
    command_result(
        "settings_save",
        "settings-command",
        "save",
        Err(CommandError::unimplemented("settings_save")),
    )
}
