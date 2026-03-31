import { TAURI_COMMANDS } from '@/constants'
import type { DatabaseHealthPayload, DatabaseSchemaVersionPayload, TauriCommandResult } from '@/types'
import { invokeTauriCommand } from './tauri.service'

// 所有数据库相关能力都统一从这里进入，避免页面层直接触达底层 command。
export const databaseService = {
	async initializeDatabase(): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(TAURI_COMMANDS.DATABASE_INITIALIZE)
	},

	async readDatabaseHealth(): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(TAURI_COMMANDS.DATABASE_CHECK_HEALTH)
	},

	async readSchemaVersion(): Promise<TauriCommandResult<DatabaseSchemaVersionPayload>> {
		return invokeTauriCommand<DatabaseSchemaVersionPayload>(TAURI_COMMANDS.DATABASE_READ_SCHEMA_VERSION)
	},
}
