use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::Map;
use stonedraw_lib::commands::CommandErrorCode;
use stonedraw_lib::storage::documents::{
    create_document_from_root, get_document_by_id_from_root, list_documents_from_root,
    list_recent_documents_from_root, move_document_to_trash_from_root,
    open_document_scene_from_root, restore_document_from_root, save_document_scene_from_root,
    SceneEnvelopePayload, SceneFilePayload, SceneMetaPayload,
};

fn unique_temp_path(name: &str) -> PathBuf {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("系统时间应晚于 UNIX_EPOCH")
        .as_nanos();

    std::env::temp_dir().join(format!("stonedraw-integration-{name}-{timestamp}"))
}

#[test]
fn document_scene_round_trip_keeps_latest_scene_and_recent_open_state() {
    let root_directory_path = unique_temp_path("round-trip");
    let created_document = create_document_from_root(&root_directory_path, Some("集成文档"))
        .expect("创建文档应成功");

    let saved_document = save_document_scene_from_root(
        &root_directory_path,
        SceneFilePayload {
            document_id: created_document.id.clone(),
            schema_version: 1,
            updated_at: 1,
            scene: SceneEnvelopePayload {
                elements: vec![
                    serde_json::json!({ "id": "element-1", "type": "rectangle" }),
                    serde_json::json!({ "id": "element-2", "type": "text" }),
                ],
                app_state: Map::new(),
                files: Map::new(),
            },
            meta: SceneMetaPayload {
                title: "不会覆盖标题".into(),
                tags: vec!["tag-a".into()],
                text_index: "集成测试".into(),
            },
        },
    )
    .expect("保存 scene 应成功");
    let reopened_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
        .expect("重新读取 scene 应成功");
    let reopened_document = get_document_by_id_from_root(&root_directory_path, &created_document.id)
        .expect("重新读取文档元数据应成功");
    let recent_documents =
        list_recent_documents_from_root(&root_directory_path).expect("最近打开列表应成功");
    let listed_documents =
        list_documents_from_root(&root_directory_path).expect("文档列表应成功");

    assert_eq!(saved_document.id, created_document.id);
    assert!(saved_document.updated_at >= created_document.updated_at);
    assert_eq!(reopened_scene.scene.elements.len(), 2);
    assert_eq!(reopened_scene.scene.elements[0]["id"], "element-1");
    assert_eq!(reopened_scene.scene.elements[1]["id"], "element-2");
    assert_eq!(reopened_scene.meta.title, "集成文档");
    assert_eq!(reopened_document.id, created_document.id);
    assert_eq!(listed_documents.len(), 1);
    assert_eq!(recent_documents.len(), 1);
    assert_eq!(recent_documents[0].id, created_document.id);

    std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
}

#[test]
fn document_error_paths_preserve_latest_saved_scene() {
    let root_directory_path = unique_temp_path("error-path");
    let created_document =
        create_document_from_root(&root_directory_path, Some("错误路径文档")).expect("创建文档应成功");

    let original_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
        .expect("初始 scene 应成功读取");

    let missing_document_error = save_document_scene_from_root(
        &root_directory_path,
        SceneFilePayload {
            document_id: "doc-missing".into(),
            schema_version: 1,
            updated_at: 1,
            scene: SceneEnvelopePayload {
                elements: vec![serde_json::json!({ "id": "missing-element" })],
                app_state: Map::new(),
                files: Map::new(),
            },
            meta: SceneMetaPayload {
                title: "错误路径文档".into(),
                tags: vec![],
                text_index: String::new(),
            },
        },
    )
    .expect_err("不存在的文档不应保存成功");

    assert_eq!(missing_document_error.code, CommandErrorCode::NotFound);

    let reopened_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
        .expect("失败后原 scene 仍应可读取");

    assert_eq!(original_scene.scene.elements, reopened_scene.scene.elements);

    let trashed_document =
        move_document_to_trash_from_root(&root_directory_path, &created_document.id)
            .expect("移动到回收站应成功");
    let restored_document =
        restore_document_from_root(&root_directory_path, &created_document.id)
            .expect("恢复文档应成功");

    assert!(trashed_document.is_deleted);
    assert!(!restored_document.is_deleted);

    std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
}

#[test]
fn invalid_save_and_corrupted_scene_recovery_keep_last_valid_scene() {
    let root_directory_path = unique_temp_path("invalid-save-recovery");
    let created_document =
        create_document_from_root(&root_directory_path, Some("恢复文档")).expect("创建文档应成功");

    save_document_scene_from_root(
        &root_directory_path,
        SceneFilePayload {
            document_id: created_document.id.clone(),
            schema_version: 1,
            updated_at: 1,
            scene: SceneEnvelopePayload {
                elements: vec![serde_json::json!({ "id": "element-valid-1" })],
                app_state: Map::new(),
                files: Map::new(),
            },
            meta: SceneMetaPayload {
                title: "恢复文档".into(),
                tags: vec![],
                text_index: String::new(),
            },
        },
    )
    .expect("初次保存应成功");

    let invalid_save_error = save_document_scene_from_root(
        &root_directory_path,
        SceneFilePayload {
            document_id: "   ".into(),
            schema_version: 1,
            updated_at: 2,
            scene: SceneEnvelopePayload {
                elements: vec![serde_json::json!({ "id": "element-invalid" })],
                app_state: Map::new(),
                files: Map::new(),
            },
            meta: SceneMetaPayload {
                title: "恢复文档".into(),
                tags: vec![],
                text_index: String::new(),
            },
        },
    )
    .expect_err("非法保存不应成功");

    assert_eq!(invalid_save_error.code, CommandErrorCode::InvalidArgument);

    let scene_after_invalid_save =
        open_document_scene_from_root(&root_directory_path, &created_document.id)
            .expect("非法保存后仍应能读取最后一次有效 scene");
    assert_eq!(scene_after_invalid_save.scene.elements.len(), 1);
    assert_eq!(scene_after_invalid_save.scene.elements[0]["id"], "element-valid-1");

    std::fs::write(&created_document.current_scene_path, "{ broken json }")
        .expect("损坏 scene 文件应可写入");

    let corrupted_open_error = open_document_scene_from_root(&root_directory_path, &created_document.id)
        .expect_err("损坏 scene 文件不应读取成功");
    assert_eq!(corrupted_open_error.code, CommandErrorCode::IoError);

    save_document_scene_from_root(
        &root_directory_path,
        SceneFilePayload {
            document_id: created_document.id.clone(),
            schema_version: 1,
            updated_at: 3,
            scene: SceneEnvelopePayload {
                elements: vec![serde_json::json!({ "id": "element-recovered-1" })],
                app_state: Map::new(),
                files: Map::new(),
            },
            meta: SceneMetaPayload {
                title: "恢复文档".into(),
                tags: vec![],
                text_index: String::new(),
            },
        },
    )
    .expect("损坏后重新保存应恢复 scene");

    let recovered_scene = open_document_scene_from_root(&root_directory_path, &created_document.id)
        .expect("恢复后 scene 应可再次读取");
    assert_eq!(recovered_scene.scene.elements.len(), 1);
    assert_eq!(recovered_scene.scene.elements[0]["id"], "element-recovered-1");

    std::fs::remove_dir_all(&root_directory_path).expect("测试目录树应可清理");
}
