import { databaseRepository } from '@/repositories'
import type { DatabaseHealthPayload, DatabaseSchemaVersionPayload, TauriCommandResult } from '@/shared/types'

// 所有数据库相关能力都统一从这里进入，避免页面层直接触达底层 command。
export const databaseService = {
	async initializeDatabase(): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return databaseRepository.initialize()
	},

	async readDatabaseHealth(): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return databaseRepository.readHealth()
	},

	async readSchemaVersion(): Promise<TauriCommandResult<DatabaseSchemaVersionPayload>> {
		return databaseRepository.readSchemaVersion()
	},
}
