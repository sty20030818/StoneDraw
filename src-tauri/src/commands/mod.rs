use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

use crate::error::{AppError, AppResult};

pub mod database;
pub mod documents;
pub mod files;
pub mod logs;
pub mod system;
pub use crate::error::AppErrorCode as CommandErrorCode;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandError {
    pub code: CommandErrorCode,
    pub message: String,
    pub details: Option<String>,
    pub command: Option<String>,
    pub layer: String,
    pub module: String,
    pub operation: String,
    pub correlation_id: String,
    pub object_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandSuccess<T: Serialize> {
    pub data: T,
}

pub type CommandResult<T> = Result<CommandSuccess<T>, Box<CommandError>>;

pub fn command_result<T: Serialize>(
    command: &str,
    module: &str,
    operation: &str,
    result: AppResult<T>,
) -> CommandResult<T> {
    result
        .map(|data| CommandSuccess { data })
        .map_err(|error| map_command_error(command, module, operation, error))
}

pub fn map_command_error(
    command: &str,
    module: &str,
    operation: &str,
    error: impl Into<Box<AppError>>,
) -> Box<CommandError> {
    let error = *error.into();
    Box::new(CommandError::from_app_error(error).attach_command_context(command, module, operation))
}

impl CommandError {
    fn from_app_error(error: AppError) -> Self {
        Self {
            code: error.code,
            message: error.message,
            details: error.details,
            command: None,
            layer: error.layer.to_string(),
            module: error.module.to_string(),
            operation: error.operation.to_string(),
            correlation_id: create_correlation_id(),
            object_id: error.object_id,
        }
    }

    pub fn attach_command_context(mut self, command: &str, module: &str, operation: &str) -> Self {
        if self.command.is_none() {
            self.command = Some(command.to_string());
        }

        if self.module == "native-command" {
            self.module = module.to_string();
        }

        if self.operation == "unknown" {
            self.operation = operation.to_string();
        }

        self
    }
}

fn create_correlation_id() -> String {
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0);

    format!("native-{millis}")
}

pub fn register(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        system::system_demo,
        database::database_initialize,
        database::database_check_health,
        database::database_read_schema_version,
        documents::documents_create,
        documents::documents_get_by_id,
        documents::documents_list,
        documents::documents_list_recent,
        documents::documents_list_trashed,
        documents::documents_open,
        documents::documents_open_scene,
        documents::editor_save_scene,
        documents::versions_create,
        documents::versions_list,
        documents::documents_rename,
        documents::documents_move_to_trash,
        documents::documents_restore,
        documents::documents_permanently_delete,
        files::files_prepare_local_directories,
        logs::logs_write_event,
    ])
}
