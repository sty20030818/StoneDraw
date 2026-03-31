use serde::Serialize;

use super::{CommandError, CommandResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetaPayload {
    pub id: String,
    pub title: String,
}

#[tauri::command]
pub fn documents_list() -> CommandResult<Vec<DocumentMetaPayload>> {
    log::warn!("documents_list 命中占位命令。");
    Err(CommandError::unimplemented("documents_list"))
}

#[tauri::command]
pub fn documents_open(document_id: String) -> CommandResult<DocumentMetaPayload> {
    if document_id.trim().is_empty() {
        return Err(CommandError::invalid_argument("document_id 不能为空"));
    }

    log::warn!("documents_open 命中占位命令。");
    Err(CommandError::unimplemented("documents_open"))
}
