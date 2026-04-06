export type DirectoryHealth = {
	path: string
	isReady: boolean
}

export type DocumentPathLayout = {
	documentDir: string
	currentScenePath: string
	assetsDir: string
	versionsDir: string
	recoveryDir: string
}

export type LocalDirectoriesPayload = {
	rootDir: DirectoryHealth
	dataDir: DirectoryHealth
	documentsDir: DirectoryHealth
	logsDir: DirectoryHealth
	templatesDir: DirectoryHealth
	assetsDir: DirectoryHealth
	cacheDir: DirectoryHealth
}
