use crate::storage::database::{
    initialize_database, read_database_health, read_database_schema_version, DatabaseHealthPayload,
    DatabaseSchemaVersionPayload,
};

use super::{success, CommandResult};

#[tauri::command]
pub fn database_initialize(app: tauri::AppHandle) -> CommandResult<DatabaseHealthPayload> {
    success(initialize_database(&app)?)
}

#[tauri::command]
pub fn database_check_health(app: tauri::AppHandle) -> CommandResult<DatabaseHealthPayload> {
    success(read_database_health(&app)?)
}

#[tauri::command]
pub fn database_read_schema_version(
    app: tauri::AppHandle,
) -> CommandResult<DatabaseSchemaVersionPayload> {
    success(read_database_schema_version(&app)?)
}
