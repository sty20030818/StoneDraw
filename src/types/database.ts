export type DatabaseHealthPayload = {
	databasePath: string
	databaseDir: string
	databaseFileName: string
	isReady: boolean
	schemaVersion: number
	targetSchemaVersion: number
}

export type DatabaseSchemaVersionPayload = {
	databasePath: string
	databaseFileName: string
	schemaVersion: number
	targetSchemaVersion: number
}
