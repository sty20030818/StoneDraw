import { invokeTauriCommand } from '@/platform/tauri'
import type { DatabaseHealthPayload, DatabaseSchemaVersionPayload, TauriCommandResult } from '@/shared/types'

const DATABASE_COMMANDS = {
	INITIALIZE: 'database_initialize',
	CHECK_HEALTH: 'database_check_health',
	READ_SCHEMA_VERSION: 'database_read_schema_version',
} as const

export const databaseRepository = {
	async initialize(correlationId?: string): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(DATABASE_COMMANDS.INITIALIZE, undefined, {
			module: 'database-repository',
			operation: 'initialize',
			layer: 'repository',
			correlationId,
		})
	},

	async readHealth(correlationId?: string): Promise<TauriCommandResult<DatabaseHealthPayload>> {
		return invokeTauriCommand<DatabaseHealthPayload>(DATABASE_COMMANDS.CHECK_HEALTH, undefined, {
			module: 'database-repository',
			operation: 'readHealth',
			layer: 'repository',
			correlationId,
		})
	},

	async readSchemaVersion(correlationId?: string): Promise<TauriCommandResult<DatabaseSchemaVersionPayload>> {
		return invokeTauriCommand<DatabaseSchemaVersionPayload>(DATABASE_COMMANDS.READ_SCHEMA_VERSION, undefined, {
			module: 'database-repository',
			operation: 'readSchemaVersion',
			layer: 'repository',
			correlationId,
		})
	},
}
