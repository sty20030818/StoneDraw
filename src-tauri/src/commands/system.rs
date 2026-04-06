use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};

use super::{command_result, CommandResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemDemoPayload {
    pub command_name: String,
    pub runtime: String,
    pub bridge_ready: bool,
    pub responded_at: String,
}

#[tauri::command]
pub fn system_demo() -> CommandResult<SystemDemoPayload> {
    log::info!("system_demo 命令调用成功。");
    let responded_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_string());

    command_result(
        "system_demo",
        "system-command",
        "demo",
        Ok(SystemDemoPayload {
            command_name: "system_demo".into(),
            runtime: "tauri".into(),
            bridge_ready: true,
            responded_at,
        }),
    )
}
