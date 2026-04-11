const DEFAULT_NATIVE_LAYER: &str = "native-command";
const DEFAULT_STORAGE_LAYER: &str = "storage";
const DEFAULT_NATIVE_MODULE: &str = "native-command";
const DEFAULT_STORAGE_MODULE: &str = "storage";
const UNKNOWN_OPERATION: &str = "unknown";

#[allow(dead_code)]
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AppErrorCode {
    IoError,
    DbError,
    InvalidArgument,
    NotFound,
    NotInitialized,
    UnimplementedCommand,
    UnknownError,
}

#[derive(Debug, Clone)]
pub struct AppError {
    pub code: AppErrorCode,
    pub message: String,
    pub details: Option<String>,
    pub object_id: Option<String>,
    pub layer: &'static str,
    pub module: &'static str,
    pub operation: &'static str,
}

pub type AppResult<T> = Result<T, Box<AppError>>;

impl AppError {
    fn new(
        code: AppErrorCode,
        message: impl Into<String>,
        layer: &'static str,
        module: &'static str,
        operation: &'static str,
    ) -> Self {
        Self {
            code,
            message: message.into(),
            details: None,
            object_id: None,
            layer,
            module,
            operation,
        }
    }

    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    pub fn with_object_id(mut self, object_id: impl Into<String>) -> Self {
        self.object_id = Some(object_id.into());
        self
    }

    pub fn boxed(self) -> Box<Self> {
        Box::new(self)
    }

    pub fn with_context(
        mut self,
        layer: &'static str,
        module: &'static str,
        operation: &'static str,
    ) -> Self {
        self.layer = layer;
        self.module = module;
        self.operation = operation;
        self
    }

    pub fn db(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            AppErrorCode::DbError,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn io(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            AppErrorCode::IoError,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn not_initialized(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            AppErrorCode::NotInitialized,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }

    pub fn invalid_argument(message: impl Into<String>) -> Self {
        Self::new(
            AppErrorCode::InvalidArgument,
            message,
            DEFAULT_NATIVE_LAYER,
            DEFAULT_NATIVE_MODULE,
            UNKNOWN_OPERATION,
        )
    }

    pub fn not_found(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self::new(
            AppErrorCode::NotFound,
            message,
            DEFAULT_STORAGE_LAYER,
            DEFAULT_STORAGE_MODULE,
            UNKNOWN_OPERATION,
        )
        .with_details(details)
    }
}
