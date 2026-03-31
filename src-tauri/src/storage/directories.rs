use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::commands::CommandError;

const STONEDRAW_HOME_DIRECTORY_NAME: &str = ".stonedraw";
const DATA_DIRECTORY_NAME: &str = "data";
const CONFIG_DIRECTORY_NAME: &str = "config";

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
    pub config_dir: DirectoryHealth,
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
    let config_dir = ensure_directory_ready(&config_dir_path(root_dir_path), "本地配置目录")?;

    Ok(LocalDirectoriesPayload {
        root_dir,
        data_dir,
        config_dir,
    })
}

fn read_local_directories_from_root(
    root_dir_path: &Path,
) -> Result<LocalDirectoriesPayload, CommandError> {
    let root_dir = inspect_directory_health(root_dir_path, "StoneDraw 根目录")?;
    let data_dir = inspect_directory_health(&data_dir_path(root_dir_path), "本地数据目录")?;
    let config_dir = inspect_directory_health(&config_dir_path(root_dir_path), "本地配置目录")?;

    Ok(LocalDirectoriesPayload {
        root_dir,
        data_dir,
        config_dir,
    })
}

pub(crate) fn data_dir_path(root_dir_path: &Path) -> PathBuf {
    root_dir_path.join(DATA_DIRECTORY_NAME)
}

fn config_dir_path(root_dir_path: &Path) -> PathBuf {
    root_dir_path.join(CONFIG_DIRECTORY_NAME)
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
        ensure_directory_ready, inspect_directory_health, prepare_local_directories_from_root,
        read_local_directories_from_root,
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
        assert!(root_directory_path.join("config").exists());
        assert_eq!(
            payload.root_dir.path,
            root_directory_path.display().to_string()
        );
        assert_eq!(
            payload.data_dir.path,
            root_directory_path.join("data").display().to_string()
        );
        assert_eq!(
            payload.config_dir.path,
            root_directory_path.join("config").display().to_string()
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
            payload.config_dir.path,
            root_directory_path.join("config").display().to_string()
        );

        fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }
}
