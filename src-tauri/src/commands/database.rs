use crate::storage::database::{
    initialize_database, read_database_health, read_database_schema_version, DatabaseHealthPayload,
    DatabaseSchemaVersionPayload,
};

use super::{command_result, CommandResult};

#[tauri::command]
pub fn database_initialize(app: tauri::AppHandle) -> CommandResult<DatabaseHealthPayload> {
    command_result(
        "database_initialize",
        "database-command",
        "initialize",
        initialize_database(&app),
    )
}

#[tauri::command]
pub fn database_check_health(app: tauri::AppHandle) -> CommandResult<DatabaseHealthPayload> {
    command_result(
        "database_check_health",
        "database-command",
        "checkHealth",
        read_database_health(&app),
    )
}

#[tauri::command]
pub fn database_read_schema_version(
    app: tauri::AppHandle,
) -> CommandResult<DatabaseSchemaVersionPayload> {
    command_result(
        "database_read_schema_version",
        "database-command",
        "readSchemaVersion",
        read_database_schema_version(&app),
    )
}
