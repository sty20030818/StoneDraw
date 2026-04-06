use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

pub mod database;
pub mod documents;
pub mod files;
pub mod logs;
pub mod settings;
pub mod system;

const DEFAULT_NATIVE_LAYER: &str = "native-command";
const DEFAULT_STORAGE_LAYER: &str = "storage";
const DEFAULT_NATIVE_MODULE: &str = "native-command";
const DEFAULT_STORAGE_MODULE: &str = "storage";
const UNKNOWN_OPERATION: &str = "unknown";

#[allow(dead_code)]
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum CommandErrorCode {
    IoError,
    DbError,
    InvalidArgument,
    NotFound,
    NotInitialized,
    UnimplementedCommand,
    UnknownError,
}

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

pub type CommandResult<T> = Result<CommandSuccess<T>, CommandError>;

pub fn success<T: Serialize>(data: T) -> CommandResult<T> {
    Ok(CommandSuccess { data })
}

pub fn command_result<T: Serialize>(
    command: &str,
    module: &str,
    operation: &str,
    result: Result<T, CommandError>,
) -> CommandResult<T> {
    result
        .map(|data| CommandSuccess { data })
        .map_err(|error| error.attach_command_context(command, module, operation))
}

impl CommandError {
    fn new(
        code: CommandErrorCode,
        message: impl Into<String>,
        layer: impl Into<String>,
        module: impl Into<String>,
        operation: impl Into<String>,
    ) -> Self {
        Self {
            code,
            message: message.into(),
            details: None,
            command: None,
            layer: layer.into(),
            module: module.into(),
            operation: operation.into(),
            correlation_id: create_correlation_id(),
            object_id: None,
        }
    }

    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    pub fn with_command(mut self, command: impl Into<String>) -> Self {
        self.command = Some(command.into());
        self
    }

    pub fn with_object_id(mut self, object_id: impl Into<String>) -> Self {
        self.object_id = Some(object_id.into());
        self
    }

    pub fn with_context(
        mut self,
        layer: impl Into<String>,
        module: impl Into<String>,
        operation: impl Into<String>,
    ) -> Self {
        self.layer = layer.into();
        self.module = module.into();
        self.operation = operation.into();
        self
    }

    pub fn attach_command_context(mut self, command: &str, module: &str, operation: &str) -> Self {
        if self.command.is_none() {
            self.command = Some(command.to_string());
        }

        if self.module == DEFAULT_NATIVE_MODULE {
            self.module = module.to_string();
        }

        if self.operation == UNKNOWN_OPERATION {
            self.operation = operation.to_string();
        }

        self
    }

    pub fn db(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            CommandErrorCode::DbError,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn io(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            CommandErrorCode::IoError,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn not_initialized(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            CommandErrorCode::NotInitialized,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn invalid_argument(message: impl Into<String>) -> Self {
        Self::new(
            CommandErrorCode::InvalidArgument,
            message,
            DEFAULT_NATIVE_LAYER,
            DEFAULT_NATIVE_MODULE,
            UNKNOWN_OPERATION,
        )
    }

    pub fn not_found(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            CommandErrorCode::NotFound,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn unimplemented(command: &str) -> Self {
        Self::new(
            CommandErrorCode::UnimplementedCommand,
            format!("命令 {command} 尚未实现"),
            DEFAULT_NATIVE_LAYER,
            DEFAULT_NATIVE_MODULE,
            "unimplemented",
        )
        .with_command(command)
        .with_details("当前版本只提供命令桥接骨架，真实业务逻辑将在后续版本补齐。")
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
        documents::documents_rename,
        documents::documents_move_to_trash,
        documents::documents_restore,
        documents::documents_permanently_delete,
        files::files_prepare_local_directories,
        files::files_read_local_directories,
        files::files_resolve_data_dir,
        files::files_resolve_config_dir,
        files::files_resolve_document_layout,
        logs::logs_write_event,
        settings::settings_read,
        settings::settings_save,
    ])
}
