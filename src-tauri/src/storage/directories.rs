use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::commands::CommandError;

const STONEDRAW_HOME_DIRECTORY_NAME: &str = ".stonedraw";
const DATA_DIRECTORY_NAME: &str = "data";
const DOCUMENTS_DIRECTORY_NAME: &str = "documents";
const LOGS_DIRECTORY_NAME: &str = "logs";
const TEMPLATES_DIRECTORY_NAME: &str = "templates";
const ROOT_ASSETS_DIRECTORY_NAME: &str = "assets";
const CACHE_DIRECTORY_NAME: &str = "cache";
const CURRENT_SCENE_FILE_NAME: &str = "current.scene.json";
const ASSETS_DIRECTORY_NAME: &str = "assets";
const VERSIONS_DIRECTORY_NAME: &str = "versions";
const RECOVERY_DIRECTORY_NAME: &str = "recovery";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryHealth {
    pub path: String,
    pub is_ready: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalDirectoriesPayload {
    pub root_dir: DirectoryHealth,
    pub data_dir: DirectoryHealth,
    pub documents_dir: DirectoryHealth,
    pub logs_dir: DirectoryHealth,
    pub templates_dir: DirectoryHealth,
    pub assets_dir: DirectoryHealth,
    pub cache_dir: DirectoryHealth,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentPathLayout {
    pub document_dir: String,
    pub current_scene_path: String,
    pub assets_dir: String,
    pub versions_dir: String,
    pub recovery_dir: String,
}

pub fn prepare_local_directories(app: &AppHandle) -> Result<LocalDirectoriesPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    prepare_local_directories_from_root(&root_dir)
}

pub fn read_local_directories(app: &AppHandle) -> Result<LocalDirectoriesPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    read_local_directories_from_root(&root_dir)
}

pub fn resolve_data_dir_string(app: &AppHandle) -> Result<String, CommandError> {
    Ok(resolve_data_dir(app)?.display().to_string())
}

pub fn resolve_config_dir_string(app: &AppHandle) -> Result<String, CommandError> {
    Ok(resolve_config_dir(app)?.display().to_string())
}

pub fn resolve_document_path_layout(
    app: &AppHandle,
    document_id: &str,
) -> Result<DocumentPathLayout, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    Ok(document_path_layout(&root_dir, document_id))
}

pub(crate) fn resolve_root_dir(app: &AppHandle) -> Result<PathBuf, CommandError> {
    app.path()
        .home_dir()
        .map(|path| path.join(STONEDRAW_HOME_DIRECTORY_NAME))
        .map_err(|error| CommandError::io("解析 StoneDraw 根目录失败", error.to_string()))
}

fn resolve_data_dir(app: &AppHandle) -> Result<PathBuf, CommandError> {
    resolve_root_dir(app).map(|path| data_dir_path(&path))
}

fn resolve_config_dir(app: &AppHandle) -> Result<PathBuf, CommandError> {
    resolve_root_dir(app).map(|path| config_dir_path(&path))
}

fn prepare_local_directories_from_root(
    root_dir_path: &Path,
) -> Result<LocalDirectoriesPayload, CommandError> {
    let root_dir = ensure_directory_ready(root_dir_path, "StoneDraw 根目录")?;
    let data_dir = ensure_directory_ready(&data_dir_path(root_dir_path), "本地数据目录")?;
    let documents_dir = ensure_directory_ready(&documents_dir_path(root_dir_path), "文档目录")?;
    let logs_dir = ensure_directory_ready(&logs_dir_path(root_dir_path), "日志目录")?;
    let templates_dir = ensure_directory_ready(&templates_dir_path(root_dir_path), "模板目录")?;
    let assets_dir = ensure_directory_ready(&root_assets_dir_path(root_dir_path), "资源目录")?;
    let cache_dir = ensure_directory_ready(&cache_dir_path(root_dir_path), "缓存目录")?;

    Ok(LocalDirectoriesPayload {
        root_dir,
        data_dir,
        documents_dir,
        logs_dir,
        templates_dir,
        assets_dir,
        cache_dir,
    })
}

fn read_local_directories_from_root(
    root_dir_path: &Path,
) -> Result<LocalDirectoriesPayload, CommandError> {
    let root_dir = inspect_directory_health(root_dir_path, "StoneDraw 根目录")?;
    let data_dir = inspect_directory_health(&data_dir_path(root_dir_path), "本地数据目录")?;
    let documents_dir = inspect_directory_health(&documents_dir_path(root_dir_path), "文档目录")?;
    let logs_dir = inspect_directory_health(&logs_dir_path(root_dir_path), "日志目录")?;
    let templates_dir = inspect_directory_health(&templates_dir_path(root_dir_path), "模板目录")?;
    let assets_dir = inspect_directory_health(&root_assets_dir_path(root_dir_path), "资源目录")?;
    let cache_dir = inspect_directory_health(&cache_dir_path(root_dir_path), "缓存目录")?;

    Ok(LocalDirectoriesPayload {
        root_dir,
        data_dir,
        documents_dir,
        logs_dir,
        templates_dir,
        assets_dir,
        cache_dir,
    })
}

pub(crate) fn data_dir_path(root_dir_path: &Path) -> PathBuf {
    root_dir_path.join(DATA_DIRECTORY_NAME)
}

fn config_dir_path(root_dir_path: &Path) -> PathBuf {
    root_dir_path.join("config")
}

pub(crate) fn documents_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(DOCUMENTS_DIRECTORY_NAME)
}

pub(crate) fn logs_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(LOGS_DIRECTORY_NAME)
}

pub(crate) fn templates_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(TEMPLATES_DIRECTORY_NAME)
}

pub(crate) fn root_assets_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(ROOT_ASSETS_DIRECTORY_NAME)
}

pub(crate) fn cache_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(CACHE_DIRECTORY_NAME)
}

pub(crate) fn document_dir_path(root_dir_path: &Path, document_id: &str) -> PathBuf {
    documents_dir_path(root_dir_path).join(document_id)
}

pub(crate) fn document_path_layout(root_dir_path: &Path, document_id: &str) -> DocumentPathLayout {
    let document_dir = document_dir_path(root_dir_path, document_id);
    let current_scene_path = document_dir.join(CURRENT_SCENE_FILE_NAME);
    let assets_dir = document_dir.join(ASSETS_DIRECTORY_NAME);
    let versions_dir = document_dir.join(VERSIONS_DIRECTORY_NAME);
    let recovery_dir = document_dir.join(RECOVERY_DIRECTORY_NAME);

    DocumentPathLayout {
        document_dir: document_dir.display().to_string(),
        current_scene_path: current_scene_path.display().to_string(),
        assets_dir: assets_dir.display().to_string(),
        versions_dir: versions_dir.display().to_string(),
        recovery_dir: recovery_dir.display().to_string(),
    }
}

fn ensure_directory_ready(path: &Path, label: &str) -> Result<DirectoryHealth, CommandError> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|error| {
            CommandError::io(
                format!("创建{label}失败"),
                format!("path={}, error={error}", path.display()),
            )
        })?;
    }

    inspect_directory_health(path, label)
}

fn inspect_directory_health(path: &Path, label: &str) -> Result<DirectoryHealth, CommandError> {
    let metadata = fs::metadata(path).map_err(|error| {
        CommandError::io(
            format!("检查{label}状态失败"),
            format!("path={}, error={error}", path.display()),
        )
    })?;

    if !metadata.is_dir() {
        return Err(CommandError::io(
            format!("{label}不可用"),
            format!("path={} 不是目录", path.display()),
        ));
    }

    if metadata.permissions().readonly() {
        return Err(CommandError::io(
            format!("{label}不可写"),
            format!("path={} 当前为只读状态", path.display()),
        ));
    }

    Ok(DirectoryHealth {
        path: path.display().to_string(),
        is_ready: true,
    })
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::commands::CommandErrorCode;

    use super::{
        document_path_layout, ensure_directory_ready, inspect_directory_health,
        prepare_local_directories_from_root, read_local_directories_from_root,
    };

    fn unique_temp_path(name: &str) -> std::path::PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("系统时间应晚于 UNIX_EPOCH")
            .as_nanos();

        std::env::temp_dir().join(format!("stonedraw-{name}-{timestamp}"))
    }

    #[test]
    fn ensure_directory_ready_creates_missing_directory() {
        let directory_path = unique_temp_path("directory-ready");

        let result = ensure_directory_ready(&directory_path, "测试目录");

        assert!(result.is_ok());
        assert!(directory_path.exists());
        assert!(directory_path.is_dir());

        fs::remove_dir_all(&directory_path).expect("测试目录应可清理");
    }

    #[test]
    fn inspect_directory_health_returns_io_error_for_file_path() {
        let file_path = unique_temp_path("file-path");

        fs::write(&file_path, "stone").expect("测试文件应写入成功");

        let error = inspect_directory_health(&file_path, "测试目录")
            .expect_err("文件路径不应被视为可用目录");

        assert_eq!(error.code, CommandErrorCode::IoError);
        assert!(error.message.contains("测试目录"));
        assert!(error.details.unwrap_or_default().contains("不是目录"));

        fs::remove_file(&file_path).expect("测试文件应可清理");
    }

    #[test]
    fn ensure_directory_ready_returns_io_error_when_parent_path_is_file() {
        let root_file_path = unique_temp_path("root-file");
        let nested_directory_path = root_file_path.join("data");

        fs::write(&root_file_path, "stone").expect("测试文件应写入成功");

        let error = ensure_directory_ready(&nested_directory_path, "测试目录")
            .expect_err("父路径为文件时不应创建目录");

        assert_eq!(error.code, CommandErrorCode::IoError);
        assert!(error.message.contains("创建测试目录失败"));
        assert!(error.details.unwrap_or_default().contains("path="));

        fs::remove_file(&root_file_path).expect("测试文件应可清理");
    }

    #[test]
    fn prepare_local_directories_from_root_creates_root_and_subdirectories() {
        let root_directory_path = unique_temp_path("stonedraw-root");

        let payload =
            prepare_local_directories_from_root(&root_directory_path).expect("应成功创建目录树");

        assert!(root_directory_path.exists());
        assert!(root_directory_path.join("data").exists());
        assert_eq!(
            payload.root_dir.path,
            root_directory_path.display().to_string()
        );
        assert_eq!(
            payload.data_dir.path,
            root_directory_path.join("data").display().to_string()
        );
        assert_eq!(
            payload.documents_dir.path,
            root_directory_path.join("data/documents").display().to_string()
        );
        assert_eq!(
            payload.logs_dir.path,
            root_directory_path.join("data/logs").display().to_string()
        );
        assert_eq!(
            payload.templates_dir.path,
            root_directory_path.join("data/templates").display().to_string()
        );
        assert_eq!(
            payload.assets_dir.path,
            root_directory_path.join("data/assets").display().to_string()
        );
        assert_eq!(
            payload.cache_dir.path,
            root_directory_path.join("data/cache").display().to_string()
        );

        fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn read_local_directories_from_root_reuses_existing_root_and_subdirectories() {
        let root_directory_path = unique_temp_path("stonedraw-root-reuse");

        prepare_local_directories_from_root(&root_directory_path).expect("首次准备目录应成功");
        let payload =
            read_local_directories_from_root(&root_directory_path).expect("重复读取目录应成功");

        assert_eq!(
            payload.root_dir.path,
            root_directory_path.display().to_string()
        );
        assert_eq!(
            payload.data_dir.path,
            root_directory_path.join("data").display().to_string()
        );
        assert_eq!(
            payload.documents_dir.path,
            root_directory_path.join("data/documents").display().to_string()
        );
        assert_eq!(
            payload.logs_dir.path,
            root_directory_path.join("data/logs").display().to_string()
        );
        assert_eq!(
            payload.templates_dir.path,
            root_directory_path.join("data/templates").display().to_string()
        );
        assert_eq!(
            payload.assets_dir.path,
            root_directory_path.join("data/assets").display().to_string()
        );
        assert_eq!(
            payload.cache_dir.path,
            root_directory_path.join("data/cache").display().to_string()
        );

        fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn read_local_directories_from_root_returns_error_when_documents_path_is_file() {
        let root_directory_path = unique_temp_path("documents-file");
        let documents_file_path = root_directory_path.join("data/documents");

        fs::create_dir_all(root_directory_path.join("data")).expect("data 目录应可创建");
        fs::create_dir_all(root_directory_path.join("data/logs")).expect("logs 目录应可创建");
        fs::create_dir_all(root_directory_path.join("data/templates")).expect("templates 目录应可创建");
        fs::create_dir_all(root_directory_path.join("data/assets")).expect("assets 目录应可创建");
        fs::create_dir_all(root_directory_path.join("data/cache")).expect("cache 目录应可创建");
        fs::write(&documents_file_path, "not-a-directory").expect("documents 文件应可写入");

        let error = read_local_directories_from_root(&root_directory_path)
            .expect_err("文档目录路径为文件时不应读取成功");

        assert_eq!(error.code, CommandErrorCode::IoError);
        assert!(error.message.contains("文档目录"));
        assert!(error.details.unwrap_or_default().contains("不是目录"));

        fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn document_path_layout_returns_stable_document_paths() {
        let root_directory_path = unique_temp_path("document-layout");
        let layout = document_path_layout(&root_directory_path, "doc-123");

        assert_eq!(
            layout.document_dir,
            root_directory_path
                .join("data/documents/doc-123")
                .display()
                .to_string()
        );
        assert_eq!(
            layout.current_scene_path,
            root_directory_path
                .join("data/documents/doc-123/current.scene.json")
                .display()
                .to_string()
        );
        assert_eq!(
            layout.assets_dir,
            root_directory_path
                .join("data/documents/doc-123/assets")
                .display()
                .to_string()
        );
        assert_eq!(
            layout.versions_dir,
            root_directory_path
                .join("data/documents/doc-123/versions")
                .display()
                .to_string()
        );
        assert_eq!(
            layout.recovery_dir,
            root_directory_path
                .join("data/documents/doc-123/recovery")
                .display()
                .to_string()
        );

        if root_directory_path.exists() {
            fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
        }
    }
}
