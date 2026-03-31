use std::fs;
use std::path::{Path, PathBuf};

use rusqlite::{params, Connection};
use serde::Serialize;
use tauri::AppHandle;

use crate::commands::CommandError;

use super::directories::{data_dir_path, resolve_root_dir};

const DATABASE_DIRECTORY_NAME: &str = "db";
const DATABASE_FILE_NAME: &str = "stonedraw.sqlite";
const MIGRATION_TABLE_NAME: &str = "schema_migrations";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseHealthPayload {
    pub database_path: String,
    pub database_dir: String,
    pub is_ready: bool,
    pub schema_version: i64,
    pub target_schema_version: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseSchemaVersionPayload {
    pub database_path: String,
    pub schema_version: i64,
    pub target_schema_version: i64,
}

#[derive(Debug, Clone, Copy)]
struct Migration {
    version: i64,
    name: &'static str,
    sql: &'static str,
}

const DEFAULT_MIGRATIONS: &[Migration] = &[Migration {
    version: 1,
    name: "0001_init",
    sql: include_str!("../../migrations/0001_init.sql"),
}];

pub fn initialize_database(app: &AppHandle) -> Result<DatabaseHealthPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    initialize_database_from_root(&root_dir, DEFAULT_MIGRATIONS)
}

pub fn read_database_health(app: &AppHandle) -> Result<DatabaseHealthPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    read_database_health_from_root(&root_dir, DEFAULT_MIGRATIONS)
}

pub fn read_database_schema_version(
    app: &AppHandle,
) -> Result<DatabaseSchemaVersionPayload, CommandError> {
    let root_dir = resolve_root_dir(app)?;
    read_database_schema_version_from_root(&root_dir, DEFAULT_MIGRATIONS)
}

fn initialize_database_from_root(
    root_dir_path: &Path,
    migrations: &[Migration],
) -> Result<DatabaseHealthPayload, CommandError> {
    let database_dir_path = database_dir_path(root_dir_path);
    let database_path = database_path(root_dir_path);

    ensure_database_directory_ready(&database_dir_path)?;

    let mut connection = open_connection(&database_path)?;
    ensure_migration_table(&connection)?;
    run_pending_migrations(&mut connection, migrations)?;

    build_database_health_payload(&connection, &database_path, migrations)
}

fn read_database_health_from_root(
    root_dir_path: &Path,
    migrations: &[Migration],
) -> Result<DatabaseHealthPayload, CommandError> {
    let database_path = database_path(root_dir_path);

    if !database_path.exists() {
        return Err(CommandError::not_initialized(
            "本地元数据数据库尚未初始化",
            format!("path={}", database_path.display()),
        ));
    }

    let connection = open_connection(&database_path)?;
    ensure_migration_table(&connection)?;

    build_database_health_payload(&connection, &database_path, migrations)
}

fn read_database_schema_version_from_root(
    root_dir_path: &Path,
    migrations: &[Migration],
) -> Result<DatabaseSchemaVersionPayload, CommandError> {
    let database_path = database_path(root_dir_path);

    if !database_path.exists() {
        return Err(CommandError::not_initialized(
            "本地元数据数据库尚未初始化",
            format!("path={}", database_path.display()),
        ));
    }

    let connection = open_connection(&database_path)?;
    ensure_migration_table(&connection)?;

    Ok(DatabaseSchemaVersionPayload {
        database_path: database_path.display().to_string(),
        schema_version: read_schema_version_from_connection(&connection)?,
        target_schema_version: latest_target_schema_version(migrations),
    })
}

fn database_dir_path(root_dir_path: &Path) -> PathBuf {
    data_dir_path(root_dir_path).join(DATABASE_DIRECTORY_NAME)
}

fn database_path(root_dir_path: &Path) -> PathBuf {
    database_dir_path(root_dir_path).join(DATABASE_FILE_NAME)
}

fn ensure_database_directory_ready(path: &Path) -> Result<(), CommandError> {
    fs::create_dir_all(path).map_err(|error| {
        CommandError::io(
            "创建 SQLite 数据库目录失败",
            format!("path={}, error={error}", path.display()),
        )
    })?;

    let metadata = fs::metadata(path).map_err(|error| {
        CommandError::io(
            "检查 SQLite 数据库目录失败",
            format!("path={}, error={error}", path.display()),
        )
    })?;

    if !metadata.is_dir() {
        return Err(CommandError::io(
            "SQLite 数据库目录不可用",
            format!("path={} 不是目录", path.display()),
        ));
    }

    Ok(())
}

fn open_connection(path: &Path) -> Result<Connection, CommandError> {
    Connection::open(path).map_err(|error| {
        CommandError::db(
            "打开 SQLite 数据库失败",
            format!("path={}, error={error}", path.display()),
        )
    })
}

fn ensure_migration_table(connection: &Connection) -> Result<(), CommandError> {
    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            ",
        )
        .map_err(|error| {
            CommandError::db(
                "初始化 migration 版本表失败",
                format!("table={MIGRATION_TABLE_NAME}, error={error}"),
            )
        })
}

fn run_pending_migrations(
    connection: &mut Connection,
    migrations: &[Migration],
) -> Result<(), CommandError> {
    let current_version = read_schema_version_from_connection(connection)?;

    for migration in migrations
        .iter()
        .filter(|migration| migration.version > current_version)
    {
        apply_migration(connection, migration)?;
    }

    Ok(())
}

fn apply_migration(connection: &mut Connection, migration: &Migration) -> Result<(), CommandError> {
    log::info!(
        "开始执行 SQLite migration: version={}, name={}",
        migration.version,
        migration.name
    );

    let transaction = connection.transaction().map_err(|error| {
        CommandError::db(
            "开启 SQLite migration 事务失败",
            format!(
                "version={}, name={}, error={error}",
                migration.version, migration.name
            ),
        )
    })?;

    transaction.execute_batch(migration.sql).map_err(|error| {
        log::error!(
            "SQLite migration 执行失败: version={}, name={}, error={}",
            migration.version,
            migration.name,
            error
        );

        CommandError::db(
            "执行 SQLite migration 失败",
            format!(
                "version={}, name={}, error={error}",
                migration.version, migration.name
            ),
        )
    })?;

    transaction
        .execute(
            "
            INSERT INTO schema_migrations (version, name, applied_at)
            VALUES (?1, ?2, CURRENT_TIMESTAMP);
            ",
            params![migration.version, migration.name],
        )
        .map_err(|error| {
            CommandError::db(
                "记录 SQLite migration 版本失败",
                format!(
                    "version={}, name={}, error={error}",
                    migration.version, migration.name
                ),
            )
        })?;

    transaction.commit().map_err(|error| {
        CommandError::db(
            "提交 SQLite migration 事务失败",
            format!(
                "version={}, name={}, error={error}",
                migration.version, migration.name
            ),
        )
    })?;

    log::info!(
        "SQLite migration 执行完成: version={}, name={}",
        migration.version,
        migration.name
    );

    Ok(())
}

fn build_database_health_payload(
    connection: &Connection,
    database_path: &Path,
    migrations: &[Migration],
) -> Result<DatabaseHealthPayload, CommandError> {
    let schema_version = read_schema_version_from_connection(connection)?;
    let target_schema_version = latest_target_schema_version(migrations);

    Ok(DatabaseHealthPayload {
        database_path: database_path.display().to_string(),
        database_dir: database_path
            .parent()
            .unwrap_or(database_path)
            .display()
            .to_string(),
        is_ready: schema_version == target_schema_version,
        schema_version,
        target_schema_version,
    })
}

fn read_schema_version_from_connection(connection: &Connection) -> Result<i64, CommandError> {
    connection
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations;",
            [],
            |row| row.get(0),
        )
        .map_err(|error| CommandError::db("读取 SQLite schema 版本失败", error.to_string()))
}

fn latest_target_schema_version(migrations: &[Migration]) -> i64 {
    migrations
        .last()
        .map(|migration| migration.version)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::commands::CommandErrorCode;

    use super::{
        initialize_database_from_root, read_database_health_from_root, Migration,
        DEFAULT_MIGRATIONS,
    };

    fn unique_temp_path(name: &str) -> std::path::PathBuf {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("系统时间应晚于 UNIX_EPOCH")
            .as_nanos();

        std::env::temp_dir().join(format!("stonedraw-db-{name}-{timestamp}"))
    }

    #[test]
    fn initialize_database_from_root_bootstraps_empty_database() {
        let root_directory_path = unique_temp_path("empty");

        let payload = initialize_database_from_root(&root_directory_path, DEFAULT_MIGRATIONS)
            .expect("空数据库首次启动应完成建库与 migration");

        assert!(root_directory_path
            .join("data/db/stonedraw.sqlite")
            .exists());
        assert!(payload.is_ready);
        assert_eq!(payload.schema_version, 1);
        assert_eq!(payload.target_schema_version, 1);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn initialize_database_from_root_upgrades_existing_database_in_order() {
        let root_directory_path = unique_temp_path("upgrade");
        let first_pass = [Migration {
            version: 1,
            name: "0001_init",
            sql: "CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);",
        }];
        let second_pass = [
            first_pass[0],
            Migration {
                version: 2,
                name: "0002_settings",
                sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);",
            },
        ];

        initialize_database_from_root(&root_directory_path, &first_pass)
            .expect("第一次初始化应创建 version 1 数据库");
        let payload = initialize_database_from_root(&root_directory_path, &second_pass)
            .expect("已有旧版本数据库应顺序升级到目标版本");

        assert!(payload.is_ready);
        assert_eq!(payload.schema_version, 2);
        assert_eq!(payload.target_schema_version, 2);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }

    #[test]
    fn initialize_database_from_root_returns_db_error_when_migration_fails() {
        let root_directory_path = unique_temp_path("migration-failure");
        let migrations = [
            Migration {
                version: 1,
                name: "0001_init",
                sql: "CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);",
            },
            Migration {
                version: 2,
                name: "0002_invalid",
                sql: "CREATE TABE broken_sql (id INTEGER PRIMARY KEY);",
            },
        ];

        let error = initialize_database_from_root(&root_directory_path, &migrations)
            .expect_err("migration 失败时应返回结构化错误");

        assert_eq!(error.code, CommandErrorCode::DbError);

        let health = read_database_health_from_root(&root_directory_path, &migrations)
            .expect("已有部分 migration 结果时仍应读取数据库健康状态");

        assert!(!health.is_ready);
        assert_eq!(health.schema_version, 1);
        assert_eq!(health.target_schema_version, 2);

        std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
    }
}
