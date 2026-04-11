use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::AppHandle;

use crate::error::{AppError, AppResult};

use super::directories::{logs_dir_path, resolve_root_dir};

static LOG_SESSION_ID: OnceLock<String> = OnceLock::new();

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogErrorPayload {
    pub code: String,
    pub message: String,
    pub layer: String,
    pub module: String,
    pub operation: String,
    pub correlation_id: String,
    pub details: Option<String>,
    pub command: Option<String>,
    pub object_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogEventPayload {
    pub level: String,
    pub layer: String,
    pub module: String,
    pub operation: String,
    pub correlation_id: String,
    pub message: String,
    pub timestamp: String,
    pub object_id: Option<String>,
    pub command: Option<String>,
    pub details: Option<String>,
    pub error: Option<LogErrorPayload>,
    pub context: Option<Value>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogWritePayload {
    pub session_id: String,
    pub log_path: String,
}

pub fn write_log_event(
    app: &AppHandle,
    event: LogEventPayload,
) -> AppResult<LogWritePayload> {
    let root_dir = resolve_root_dir(app)?;
    write_log_event_from_root(&root_dir, event)
}

fn write_log_event_from_root(
    root_dir_path: &Path,
    event: LogEventPayload,
) -> AppResult<LogWritePayload> {
    let logs_dir = logs_dir_path(root_dir_path);

    fs::create_dir_all(&logs_dir).map_err(|error| {
        AppError::io(
            "创建日志目录失败",
            format!("path={}, error={error}", logs_dir.display()),
        )
        .with_context("storage", "logs-storage", "writeEvent")
        .boxed()
    })?;

    let log_path = session_log_path(root_dir_path);
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|error| {
            AppError::io(
                "打开日志文件失败",
                format!("path={}, error={error}", log_path.display()),
            )
            .with_context("storage", "logs-storage", "writeEvent")
            .boxed()
        })?;

    let payload = serde_json::to_string(&event).map_err(|error| {
        AppError::io("序列化日志事件失败", error.to_string())
            .with_context("storage", "logs-storage", "writeEvent")
            .boxed()
    })?;

    file.write_all(payload.as_bytes()).map_err(|error| {
        AppError::io(
            "写入日志事件失败",
            format!("path={}, error={error}", log_path.display()),
        )
        .with_context("storage", "logs-storage", "writeEvent")
        .boxed()
    })?;
    file.write_all(b"\n").map_err(|error| {
        AppError::io(
            "写入日志换行失败",
            format!("path={}, error={error}", log_path.display()),
        )
        .with_context("storage", "logs-storage", "writeEvent")
        .boxed()
    })?;

    Ok(LogWritePayload {
        session_id: session_id().to_string(),
        log_path: log_path.display().to_string(),
    })
}

fn session_log_path(root_dir_path: &Path) -> PathBuf {
    logs_dir_path(root_dir_path).join(format!("{}.jsonl", session_id()))
}

fn session_id() -> &'static str {
    LOG_SESSION_ID
        .get_or_init(|| format!("session-{}", current_timestamp_millis()))
        .as_str()
}

fn current_timestamp_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use serde_json::Value;

    use super::{write_log_event_from_root, LogErrorPayload, LogEventPayload};

    fn unique_temp_path(name: &str) -> std::path::PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("系统时间应晚于 UNIX_EPOCH")
            .as_nanos();

        std::env::temp_dir().join(format!("stonedraw-logs-{name}-{timestamp}"))
    }

    fn create_log_event(message: &str) -> LogEventPayload {
        LogEventPayload {
            level: "info".into(),
            layer: "bootstrap".into(),
            module: "bootstrap-runtime".into(),
            operation: "run".into(),
            correlation_id: "test-correlation-id".into(),
            message: message.into(),
            timestamp: "2026-04-06T00:00:00.000Z".into(),
            object_id: Some("doc-1".into()),
            command: Some("documents_open".into()),
            details: None,
            error: Some(LogErrorPayload {
                code: "NOT_FOUND".into(),
                message: "文档不存在".into(),
                layer: "storage".into(),
                module: "documents-storage".into(),
                operation: "open".into(),
                correlation_id: "test-correlation-id".into(),
                details: Some("documentId=doc-1".into()),
                command: Some("documents_open".into()),
                object_id: Some("doc-1".into()),
            }),
            context: Some(Value::String("bootstrap".into())),
        }
    }

    #[test]
    fn write_log_event_from_root_creates_session_log_file() {
        let root_directory_path = unique_temp_path("create");
        let result = write_log_event_from_root(&root_directory_path, create_log_event("首次日志"))
            .expect("首次写日志应创建 session 日志文件");

        let log_path = std::path::PathBuf::from(&result.log_path);
        let content = std::fs::read_to_string(&log_path).expect("日志文件应可读取");

        assert!(content.contains("首次日志"));
        assert!(content.contains("\"correlationId\":\"test-correlation-id\""));

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录应可清理");
    }

    #[test]
    fn write_log_event_from_root_appends_without_overwriting_existing_content() {
        let root_directory_path = unique_temp_path("append");

        let first = write_log_event_from_root(&root_directory_path, create_log_event("第一条日志"))
            .expect("第一条日志应写入成功");
        let second = write_log_event_from_root(&root_directory_path, create_log_event("第二条日志"))
            .expect("第二条日志应追加成功");

        assert_eq!(first.session_id, second.session_id);
        assert_eq!(first.log_path, second.log_path);

        let content = std::fs::read_to_string(&first.log_path).expect("日志文件应可读取");
        let lines: Vec<&str> = content.lines().collect();

        assert_eq!(lines.len(), 2);
        assert!(lines[0].contains("第一条日志"));
        assert!(lines[1].contains("第二条日志"));

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录应可清理");
    }
}
