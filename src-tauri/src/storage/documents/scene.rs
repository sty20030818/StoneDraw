use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

use crate::error::{AppError, AppResult};
use crate::storage::directories::{document_path_layout, DocumentPathLayout};

use super::meta::{get_document_by_id_from_root, DocumentMetaPayload};
use super::{current_timestamp_ms, default_document_title_owned, default_schema_version, DEFAULT_SCHEMA_VERSION};

#[cfg(windows)]
const MOVEFILE_REPLACE_EXISTING: u32 = 0x1;
#[cfg(windows)]
const MOVEFILE_WRITE_THROUGH: u32 = 0x8;

#[cfg(windows)]
unsafe extern "system" {
    fn MoveFileExW(
        existing_file_name: *const u16,
        new_file_name: *const u16,
        flags: u32,
    ) -> i32;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneEnvelopePayload {
    pub elements: Vec<Value>,
    #[serde(default)]
    pub app_state: Map<String, Value>,
    #[serde(default)]
    pub files: Map<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneMetaPayload {
    #[serde(default = "default_document_title_owned")]
    pub title: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub text_index: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SceneFilePayload {
    pub document_id: String,
    #[serde(default = "default_schema_version")]
    pub schema_version: i64,
    pub updated_at: i64,
    pub scene: SceneEnvelopePayload,
    pub meta: SceneMetaPayload,
}

#[derive(Debug, Clone)]
pub struct DocumentSceneWriteResult {
    pub document_id: String,
    pub scene_path: String,
    pub updated_at: i64,
}

pub fn open_document_scene_from_root(
    root_dir_path: &Path,
    document_id: &str,
) -> AppResult<SceneFilePayload> {
    let document_meta = get_document_by_id_from_root(root_dir_path, document_id)?;
    let scene_path = ensure_document_scene_ready(root_dir_path, &document_meta)?;
    let scene_payload = read_scene_file(&scene_path)?;

    if scene_payload.document_id != document_id {
        return Err(AppError::io(
            "读取文档 scene 文件失败",
            format!(
                "path={}, reason=documentId mismatch, expected={}, actual={}",
                scene_path.display(),
                document_id,
                scene_payload.document_id
            ),
        )
        .boxed());
    }

    Ok(scene_payload)
}

pub fn write_document_scene_from_root(
    root_dir_path: &Path,
    mut scene_payload: SceneFilePayload,
) -> AppResult<DocumentSceneWriteResult> {
    let document_id = scene_payload.document_id.trim().to_string();

    if document_id.is_empty() {
        return Err(AppError::invalid_argument("scene.documentId 不能为空").boxed());
    }

    let existing_document = get_document_by_id_from_root(root_dir_path, &document_id)?;
    let saved_at = current_timestamp_ms()?;

    scene_payload.document_id = document_id.clone();
    scene_payload.schema_version = default_schema_version();
    scene_payload.updated_at = saved_at;
    scene_payload.meta.title = existing_document.title.clone();

    let scene_path = ensure_document_scene_ready(root_dir_path, &existing_document)?;
    write_scene_file(scene_path.as_path(), &scene_payload)?;

    Ok(DocumentSceneWriteResult {
        document_id,
        scene_path: scene_path.display().to_string(),
        updated_at: saved_at,
    })
}

#[cfg(test)]
pub(super) fn save_document_scene_from_root(
    root_dir_path: &Path,
    scene_payload: SceneFilePayload,
) -> AppResult<DocumentMetaPayload> {
    let write_result = write_document_scene_from_root(root_dir_path, scene_payload)?;

    if let Err(error) =
        super::meta::update_document_after_scene_save(root_dir_path, &write_result.document_id, write_result.updated_at)
    {
        let details = error.details.as_deref().unwrap_or_default();
        let details_suffix = if details.is_empty() {
            String::new()
        } else {
            format!(", cause={details}")
        };

        return Err(
            (*error)
                .with_object_id(write_result.document_id.clone())
                .with_details(format!(
                    "documentId={}, scenePath={}, scene 已保存但元数据更新失败{details_suffix}",
                    write_result.document_id, write_result.scene_path
                ))
                .boxed(),
        );
    }

    get_document_by_id_from_root(root_dir_path, &write_result.document_id)
}

pub(super) fn scene_relative_path(layout: &DocumentPathLayout) -> String {
    PathBuf::from("documents")
        .join(
            Path::new(&layout.document_dir)
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or_default(),
        )
        .join("current.scene.json")
        .display()
        .to_string()
}

pub fn ensure_document_scene_ready(
    root_dir_path: &Path,
    document_meta: &DocumentMetaPayload,
) -> AppResult<PathBuf> {
    let layout = document_path_layout(root_dir_path, &document_meta.id);
    let scene_path = PathBuf::from(&layout.current_scene_path);

    ensure_document_layout_ready(&layout)?;

    if scene_path.exists() {
        return Ok(scene_path);
    }

    let scene_payload =
        create_empty_scene_payload(&document_meta.id, &document_meta.title, current_timestamp_ms()?);
    write_scene_file(scene_path.as_path(), &scene_payload).map_err(|error| {
        let details = error.details.as_deref().unwrap_or_default().to_string();

        (*error)
            .with_object_id(document_meta.id.clone())
            .with_details(format!(
                "documentId={}, scenePath={}, scene 缺失且自愈初始化失败, cause={details}",
                document_meta.id,
                scene_path.display(),
            ))
            .boxed()
    })?;

    Ok(scene_path)
}

pub(super) fn ensure_document_layout_ready(
    layout: &DocumentPathLayout,
) -> AppResult<()> {
    for path in [
        &layout.document_dir,
        &layout.assets_dir,
        &layout.versions_dir,
        &layout.recovery_dir,
    ] {
        fs::create_dir_all(path).map_err(|error| {
            AppError::io(
                "创建文档目录结构失败",
                format!("path={path}, error={error}"),
            )
            .boxed()
        })?;
    }

    Ok(())
}

pub(super) fn create_empty_scene_payload(
    document_id: &str,
    title: &str,
    updated_at: i64,
) -> SceneFilePayload {
    SceneFilePayload {
        document_id: document_id.into(),
        schema_version: DEFAULT_SCHEMA_VERSION,
        updated_at,
        scene: SceneEnvelopePayload {
            elements: Vec::new(),
            app_state: Map::new(),
            files: Map::new(),
        },
        meta: SceneMetaPayload {
            title: title.into(),
            tags: Vec::new(),
            text_index: String::new(),
        },
    }
}

pub(super) fn write_scene_file(
    path: &Path,
    scene_payload: &SceneFilePayload,
) -> AppResult<()> {
    let bytes = serde_json::to_vec_pretty(scene_payload).map_err(|error| {
        AppError::io(
            "序列化 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
        .boxed()
    })?;
    let temp_path = create_scene_temp_path(path)?;
    let write_result = (|| -> AppResult<()> {
        let mut temp_file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp_path)
            .map_err(|error| {
                AppError::io(
                    "创建临时 scene 文件失败",
                    format!("path={}, error={error}", temp_path.display()),
                )
                .boxed()
            })?;

        temp_file.write_all(&bytes).map_err(|error| {
            AppError::io(
                "写入临时 scene 文件失败",
                format!("path={}, error={error}", temp_path.display()),
            )
            .boxed()
        })?;
        temp_file.sync_all().map_err(|error| {
            AppError::io(
                "刷盘临时 scene 文件失败",
                format!("path={}, error={error}", temp_path.display()),
            )
            .boxed()
        })?;
        drop(temp_file);

        replace_file_atomically(&temp_path, path).map_err(|error| {
            AppError::io(
                "替换正式 scene 文件失败",
                format!(
                    "tempPath={}, targetPath={}, error={error}",
                    temp_path.display(),
                    path.display()
                ),
            )
            .boxed()
        })?;

        Ok(())
    })();

    if write_result.is_err() && temp_path.exists() {
        let _ = fs::remove_file(&temp_path);
    }

    write_result
}

pub(super) fn read_scene_file(path: &Path) -> AppResult<SceneFilePayload> {
    let raw_content = fs::read_to_string(path).map_err(|error| {
        AppError::io(
            "读取文档 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
        .boxed()
    })?;

    serde_json::from_str::<SceneFilePayload>(&raw_content).map_err(|error| {
        AppError::io(
            "解析文档 scene 文件失败",
            format!("path={}, error={error}", path.display()),
        )
        .boxed()
    })
}

pub(super) fn cleanup_document_directory(document_dir: &str) {
    let document_path = PathBuf::from(document_dir);

    if !document_path.exists() {
        return;
    }

    if let Err(error) = fs::remove_dir_all(&document_path) {
        log::warn!(
            "清理文档目录补偿失败: path={}, error={}",
            document_path.display(),
            error
        );
    }
}

fn create_scene_temp_path(path: &Path) -> AppResult<PathBuf> {
    let parent = path.parent().ok_or_else(|| {
        AppError::io(
            "解析临时 scene 文件目录失败",
            format!("path={} 缺少父目录", path.display()),
        )
        .boxed()
    })?;
    let file_name = path.file_name().and_then(|value| value.to_str()).ok_or_else(|| {
        AppError::io(
            "解析临时 scene 文件名失败",
            format!("path={} 缺少有效文件名", path.display()),
        )
        .boxed()
    })?;
    let timestamp = current_timestamp_ms()?;

    Ok(parent.join(format!(
        "{file_name}.tmp-{timestamp}-{}",
        std::process::id()
    )))
}

#[cfg(windows)]
fn replace_file_atomically(source: &Path, target: &Path) -> std::io::Result<()> {
    let source_wide = encode_wide_path(source);
    let target_wide = encode_wide_path(target);
    let result = unsafe {
        MoveFileExW(
            source_wide.as_ptr(),
            target_wide.as_ptr(),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };

    if result == 0 {
        return Err(std::io::Error::last_os_error());
    }

    Ok(())
}

#[cfg(windows)]
fn encode_wide_path(path: &Path) -> Vec<u16> {
    path.as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

#[cfg(not(windows))]
fn replace_file_atomically(source: &Path, target: &Path) -> std::io::Result<()> {
    fs::rename(source, target)
}
