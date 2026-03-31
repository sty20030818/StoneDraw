export type DatabaseHealthPayload = {
	databasePath: string
	databaseDir: string
	isReady: boolean
	schemaVersion: number
	targetSchemaVersion: number
}

export type DatabaseSchemaVersionPayload = {
	databasePath: string
	schemaVersion: number
	targetSchemaVersion: number
}
