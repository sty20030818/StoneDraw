import type { DatabaseHealthPayload, LocalDirectoriesPayload } from '@/types'

export function createLocalDirectoriesPayload(overrides: Partial<LocalDirectoriesPayload> = {}): LocalDirectoriesPayload {
	return {
		rootDir: {
			path: '/tmp/.stonedraw',
			isReady: true,
		},
		dataDir: {
			path: '/tmp/.stonedraw/data',
			isReady: true,
		},
		documentsDir: {
			path: '/tmp/.stonedraw/data/documents',
			isReady: true,
		},
		logsDir: {
			path: '/tmp/.stonedraw/data/logs',
			isReady: true,
		},
		templatesDir: {
			path: '/tmp/.stonedraw/data/templates',
			isReady: true,
		},
		assetsDir: {
			path: '/tmp/.stonedraw/data/assets',
			isReady: true,
		},
		cacheDir: {
			path: '/tmp/.stonedraw/data/cache',
			isReady: true,
		},
		...overrides,
	}
}

export function createDatabaseHealthPayload(
	overrides: Partial<DatabaseHealthPayload> = {},
): DatabaseHealthPayload {
	return {
		databasePath: '/tmp/.stonedraw/data/db/app.db',
		databaseDir: '/tmp/.stonedraw/data/db',
		databaseFileName: 'app.db',
		isReady: true,
		schemaVersion: 4,
		targetSchemaVersion: 4,
		...overrides,
	}
}
