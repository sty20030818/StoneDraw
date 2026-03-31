export const TAURI_COMMANDS = {
	DOCUMENTS_LIST: 'documents_list',
	DOCUMENTS_OPEN: 'documents_open',
	FILES_PREPARE_LOCAL_DIRECTORIES: 'files_prepare_local_directories',
	FILES_READ_LOCAL_DIRECTORIES: 'files_read_local_directories',
	FILES_RESOLVE_DATA_DIR: 'files_resolve_data_dir',
	FILES_RESOLVE_CONFIG_DIR: 'files_resolve_config_dir',
	SETTINGS_READ: 'settings_read',
	SETTINGS_SAVE: 'settings_save',
	EDITOR_LOAD_SCENE: 'editor_load_scene',
	EDITOR_SAVE_SCENE: 'editor_save_scene',
	SYSTEM_DEMO: 'system_demo',
} as const
