use crate::storage::logs::{write_log_event, LogEventPayload, LogWritePayload};

use super::{command_result, CommandResult};

#[tauri::command]
pub fn logs_write_event(
    app: tauri::AppHandle,
    event: LogEventPayload,
) -> CommandResult<LogWritePayload> {
    command_result(
        "logs_write_event",
        "logs-command",
        "writeEvent",
        write_log_event(&app, event),
    )
}
