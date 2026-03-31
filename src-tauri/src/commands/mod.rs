use serde::Serialize;

pub mod documents;
pub mod files;
pub mod settings;
pub mod system;

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

impl CommandError {
    pub fn io(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self {
            code: CommandErrorCode::IoError,
            message: message.into(),
            details: Some(details.into()),
        }
    }

    pub fn invalid_argument(message: impl Into<String>) -> Self {
        Self {
            code: CommandErrorCode::InvalidArgument,
            message: message.into(),
            details: None,
        }
    }

    pub fn unimplemented(command: &str) -> Self {
        Self {
            code: CommandErrorCode::UnimplementedCommand,
            message: format!("命令 {command} 尚未实现"),
            details: Some("当前版本只提供命令桥接骨架，真实业务逻辑将在后续版本补齐。".into()),
        }
    }
}

pub fn register(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        system::system_demo,
        documents::documents_list,
        documents::documents_open,
        files::files_prepare_local_directories,
        files::files_read_local_directories,
        files::files_resolve_data_dir,
        files::files_resolve_config_dir,
        settings::settings_read,
        settings::settings_save,
    ])
}
