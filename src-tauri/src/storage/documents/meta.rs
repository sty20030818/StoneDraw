use std::fs;
use std::path::{Path, PathBuf};

use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::commands::CommandError;
use crate::storage::database::open_ready_connection;
use crate::storage::directories::document_path_layout;

use super::scene::{
    cleanup_document_directory, create_empty_scene_payload, ensure_document_layout_ready,
    ensure_document_scene_ready, scene_relative_path, write_scene_file,
};
use super::{
    current_timestamp_ms, generate_document_id, normalize_optional_document_title,
    normalize_required_document_title, DEFAULT_SAVE_STATUS, DEFAULT_SOURCE_TYPE,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetaPayload {
    pub id: String,
    pub title: String,
    pub current_scene_path: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_opened_at: Option<i64>,
    pub is_deleted: bool,
    pub deleted_at: Option<i64>,
    pub source_type: String,
    pub save_status: String,
}

#[derive(Debug, Clone, Copy)]
pub(super) enum DocumentFilter {
    Active,
    Deleted,
    Any,
}

pub fn create_document_from_root(
    root_dir_path: &Path,
    title: Option<&str>,
) -> Result<DocumentMetaPayload, CommandError> {
    let now = current_timestamp_ms()?;
    let document_id = generate_document_id(now);
    let normalized_title = normalize_optional_document_title(title);
    let layout = document_path_layout(root_dir_path, &document_id);

    ensure_document_layout_ready(&layout)?;

    let scene_payload = create_empty_scene_payload(&document_id, &normalized_title, now);
    write_scene_file(Path::new(&layout.current_scene_path), &scene_payload)?;

    let document_meta = DocumentMetaPayload {
        id: document_id,
        title: normalized_title,
        current_scene_path: scene_relative_path(&layout),
        created_at: now,
        updated_at: now,
        last_opened_at: None,
        is_deleted: false,
        deleted_at: None,
        source_type: DEFAULT_SOURCE_TYPE.into(),
        save_status: DEFAULT_SAVE_STATUS.into(),
    };

    if let Err(error) = insert_document_meta(root_dir_path, &document_meta) {
        cleanup_document_directory(&layout.document_dir);
        return Err(error);
    }

    Ok(document_meta)
}

pub fn get_document_by_id_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Active)?.ok_or_else(|| {
        CommandError::not_found(
            "文档不存在",
            format!("documentId={document_id} 未命中可用文档记录"),
        )
    })
}

pub fn get_document_by_id_any_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Any)?.ok_or_else(|| {
        CommandError::not_found(
            "文档不存在",
            format!("documentId={document_id} 未命中记录"),
        )
    })
}

pub fn get_trashed_document_by_id_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Deleted)?.ok_or_else(|| {
        CommandError::not_found(
            "文档不存在",
            format!("documentId={document_id} 未命中回收站记录"),
        )
    })
}

pub fn list_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            id,
            title,
            current_scene_path,
            created_at,
            updated_at,
            last_opened_at,
            is_deleted,
            deleted_at,
            source_type,
            save_status
        FROM documents
        WHERE is_deleted = 0
        ORDER BY updated_at DESC;
        ",
        "读取文档列表",
    )
}

pub fn list_recent_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            d.id,
            d.title,
            d.current_scene_path,
            d.created_at,
            d.updated_at,
            d.last_opened_at,
            d.is_deleted,
            d.deleted_at,
            d.source_type,
            d.save_status
        FROM recent_opens AS ro
        INNER JOIN documents AS d ON d.id = ro.document_id
        WHERE d.is_deleted = 0
        ORDER BY ro.opened_at DESC;
        ",
        "读取最近打开列表",
    )
}

pub fn list_trashed_documents_from_root(
    root_dir_path: &Path,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    list_document_metas(
        &connection,
        "
        SELECT
            id,
            title,
            current_scene_path,
            created_at,
            updated_at,
            last_opened_at,
            is_deleted,
            deleted_at,
            source_type,
            save_status
        FROM documents
        WHERE is_deleted = 1
        ORDER BY deleted_at DESC, updated_at DESC;
        ",
        "读取回收站文档列表",
    )
}

pub fn rename_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
    title: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let normalized_title = normalize_required_document_title(title)?;
    let now = current_timestamp_ms()?;
    let connection = open_ready_connection(root_dir_path)?;

    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET title = ?1, updated_at = ?2
            WHERE id = ?3 AND is_deleted = 0;
            ",
            params![normalized_title, now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档标题失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或已删除",
            format!("documentId={document_id} 无法重命名"),
        ));
    }

    get_document_by_id_from_root(root_dir_path, document_id)
}

#[cfg(test)]
pub(super) fn move_document_to_trash_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let existing_document = get_document_by_id_any_from_root(root_dir_path, document_id)?;

    if existing_document.is_deleted {
        return Ok(existing_document);
    }

    mark_document_trashed_from_root(root_dir_path, document_id)?;
    get_trashed_document_by_id_from_root(root_dir_path, document_id)
}

pub fn mark_document_trashed_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let now = current_timestamp_ms()?;
    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET is_deleted = 1, deleted_at = ?1, updated_at = ?1
            WHERE id = ?2 AND is_deleted = 0;
            ",
            params![now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "移动文档到回收站失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或已删除",
            format!("documentId={document_id} 无法更新删除状态"),
        ));
    }

    Ok(())
}

#[cfg(test)]
pub(super) fn restore_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let existing_document = get_document_by_id_any_from_root(root_dir_path, document_id)?;

    if !existing_document.is_deleted {
        return Ok(existing_document);
    }

    mark_document_restored_from_root(root_dir_path, document_id)?;
    get_document_by_id_from_root(root_dir_path, document_id)
}

pub fn mark_document_restored_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let now = current_timestamp_ms()?;
    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET is_deleted = 0, deleted_at = NULL, updated_at = ?1
            WHERE id = ?2 AND is_deleted = 1;
            ",
            params![now, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "恢复文档失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或未处于回收站",
            format!("documentId={document_id} 无法恢复"),
        ));
    }

    Ok(())
}

#[cfg(test)]
pub(super) fn open_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<DocumentMetaPayload, CommandError> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;

    ensure_document_scene_ready(root_dir_path, &document_meta)?;
    record_document_opened_from_root(root_dir_path, document_id)?;

    get_document_by_id_from_root(root_dir_path, document_id)
}

#[cfg(test)]
pub(super) fn permanently_delete_document_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<(), CommandError> {
    let document_dir = delete_document_records_from_root(root_dir_path, document_id)?;

    if Path::new(&document_dir).exists() {
        fs::remove_dir_all(&document_dir).map_err(|error| {
            CommandError::io(
                "删除文档目录失败",
                format!("documentId={document_id}, path={document_dir}, error={error}"),
            )
        })?;
    }

    Ok(())
}

pub fn delete_document_records_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<String, CommandError> {
    let mut connection = open_ready_connection(root_dir_path)?;
    let existing_document =
        fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Any)?.ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法永久删除"),
            )
        })?;
    let layout = document_path_layout(root_dir_path, &existing_document.id);
    let transaction = connection.transaction().map_err(|error| {
        CommandError::db(
            "开启永久删除事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    for sql in [
        "DELETE FROM recent_opens WHERE document_id = ?1;",
        "DELETE FROM document_tags WHERE document_id = ?1;",
        "DELETE FROM document_search_index WHERE document_id = ?1;",
        "DELETE FROM versions WHERE document_id = ?1;",
        "DELETE FROM recovery_drafts WHERE document_id = ?1;",
        "DELETE FROM assets WHERE document_id = ?1;",
        "DELETE FROM workspace_states WHERE active_document_id = ?1;",
        "DELETE FROM workbench_sessions WHERE document_id = ?1;",
        "DELETE FROM documents WHERE id = ?1;",
    ] {
        transaction.execute(sql, params![document_id]).map_err(|error| {
            CommandError::db(
                "清理文档元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;
    }

    transaction.commit().map_err(|error| {
        CommandError::db(
            "提交永久删除事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    Ok(layout.document_dir)
}

pub(super) fn fetch_document_meta_by_id(
    connection: &Connection,
    document_id: &str,
    filter: DocumentFilter,
) -> Result<Option<DocumentMetaPayload>, CommandError> {
    let sql = match filter {
        DocumentFilter::Active => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1 AND is_deleted = 0
            LIMIT 1;
            "
        }
        DocumentFilter::Deleted => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1 AND is_deleted = 1
            LIMIT 1;
            "
        }
        DocumentFilter::Any => {
            "
            SELECT
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            FROM documents
            WHERE id = ?1
            LIMIT 1;
            "
        }
    };

    connection
        .query_row(sql, params![document_id], map_document_meta_row)
        .optional()
        .map_err(|error| {
            CommandError::db(
                "读取文档元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })
}

pub fn update_document_after_scene_save(
    root_dir_path: &Path,
    document_id: &str,
    saved_at: i64,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;
    let affected_rows = connection
        .execute(
            "
            UPDATE documents
            SET updated_at = ?1, save_status = ?2
            WHERE id = ?3 AND is_deleted = 0;
            ",
            params![saved_at, DEFAULT_SAVE_STATUS, document_id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档保存元数据失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    if affected_rows == 0 {
        return Err(CommandError::not_found(
            "文档不存在或已删除",
            format!("documentId={document_id} 无法更新保存结果"),
        ));
    }

    Ok(())
}

fn map_document_meta_row(row: &Row<'_>) -> rusqlite::Result<DocumentMetaPayload> {
    let is_deleted: i64 = row.get(6)?;
    let document_id: String = row.get(0)?;

    Ok(DocumentMetaPayload {
        id: document_id.clone(),
        title: row.get(1)?,
        current_scene_path: PathBuf::from("documents")
            .join(&document_id)
            .join("current.scene.json")
            .display()
            .to_string(),
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
        last_opened_at: row.get(5)?,
        is_deleted: is_deleted != 0,
        deleted_at: row.get(7)?,
        source_type: row.get(8)?,
        save_status: row.get(9)?,
    })
}

fn list_document_metas(
    connection: &Connection,
    sql: &str,
    operation_label: &str,
) -> Result<Vec<DocumentMetaPayload>, CommandError> {
    let mut statement = connection.prepare(sql).map_err(|error| {
        CommandError::db(
            format!("准备{operation_label}查询失败"),
            error.to_string(),
        )
    })?;

    let rows = statement.query_map([], map_document_meta_row).map_err(|error| {
        CommandError::db(
            format!("执行{operation_label}查询失败"),
            error.to_string(),
        )
    })?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|error| {
        CommandError::db(
            format!("解析{operation_label}结果失败"),
            error.to_string(),
        )
    })
}

fn insert_document_meta(
    root_dir_path: &Path,
    document_meta: &DocumentMetaPayload,
) -> Result<(), CommandError> {
    let connection = open_ready_connection(root_dir_path)?;

    connection
        .execute(
            "
            INSERT INTO documents (
                id,
                title,
                current_scene_path,
                created_at,
                updated_at,
                last_opened_at,
                is_deleted,
                deleted_at,
                source_type,
                save_status
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);
            ",
            params![
                document_meta.id,
                document_meta.title,
                document_meta.current_scene_path,
                document_meta.created_at,
                document_meta.updated_at,
                document_meta.last_opened_at,
                if document_meta.is_deleted { 1 } else { 0 },
                document_meta.deleted_at,
                document_meta.source_type,
                document_meta.save_status,
            ],
        )
        .map_err(|error| {
            CommandError::db(
                "写入文档元数据失败",
                format!("documentId={}, error={error}", document_meta.id),
            )
        })?;

    Ok(())
}

pub fn record_document_opened_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> Result<(), CommandError> {
    let mut connection = open_ready_connection(root_dir_path)?;
    let existing_document = fetch_document_meta_by_id(&connection, document_id, DocumentFilter::Active)?
        .ok_or_else(|| {
            CommandError::not_found(
                "文档不存在",
                format!("documentId={document_id} 无法记录最近打开"),
            )
        })?;

    let now = current_timestamp_ms()?;
    let transaction = connection.transaction().map_err(|error| {
        CommandError::db(
            "开启最近打开写入事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })?;

    transaction
        .execute(
            "
            UPDATE documents
            SET last_opened_at = ?1
            WHERE id = ?2 AND is_deleted = 0;
            ",
            params![now, existing_document.id],
        )
        .map_err(|error| {
            CommandError::db(
                "更新文档最近打开时间失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    transaction
        .execute(
            "
            INSERT INTO recent_opens (id, document_id, opened_at)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(id) DO UPDATE SET
                document_id = excluded.document_id,
                opened_at = excluded.opened_at;
            ",
            params![document_id, document_id, now],
        )
        .map_err(|error| {
            CommandError::db(
                "写入最近打开记录失败",
                format!("documentId={document_id}, error={error}"),
            )
        })?;

    transaction.commit().map_err(|error| {
        CommandError::db(
            "提交最近打开事务失败",
            format!("documentId={document_id}, error={error}"),
        )
    })
}
