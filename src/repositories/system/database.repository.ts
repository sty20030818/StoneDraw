import { TAURI_COMMANDS } from '@/constants'
import { invokeTauriCommand } from '@/infra/tauri'
import type { DatabaseHealthPayload, DatabaseSchemaVersionPayload, TauriCommandResult } from '@/types'

export const databaseRepository = {
	async initialize(correlationId?: string): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(TAURI_COMMANDS.DATABASE_INITIALIZE, undefined, {
			module: 'database-repository',
			operation: 'initialize',
			layer: 'repository',
			correlationId,
		})
	},

	async readHealth(correlationId?: string): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(TAURI_COMMANDS.DATABASE_CHECK_HEALTH, undefined, {
			module: 'database-repository',
			operation: 'readHealth',
			layer: 'repository',
			correlationId,
		})
	},

	async readSchemaVersion(correlationId?: string): Promise<TauriCommandResult<DatabaseSchemaVersionPayload>> {
		return invokeTauriCommand<DatabaseSchemaVersionPayload>(TAURI_COMMANDS.DATABASE_READ_SCHEMA_VERSION, undefined, {
			module: 'database-repository',
			operation: 'readSchemaVersion',
			layer: 'repository',
			correlationId,
		})
	},
}
